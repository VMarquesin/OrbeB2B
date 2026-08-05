using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OrbeB2B.AutoAtendimento.Application.Repositories;
using OrbeB2B.AutoAtendimento.Application.Services.Interfaces;
using OrbeB2B.AutoAtendimento.Application.Validators;
using OrbeB2B.AutoAtendimento.Infrastructure.Data.Repositories;
using OrbeB2B.AutoAtendimento.Infrastructure.Identity;
using OrbeB2B.AutoAtendimento.Infrastructure.Services;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Infrastructure.Data;
using OrbeB2B.Crm.Infrastructure.Data.Repositories;
using System.Text;

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OrbeB2B AutoAtendimento API",
        Version = "v1",
        Description = "Portal B2B - API de AutoAtendimento do Comprador"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT desta maneira: Bearer {seu token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// FluentValidation: intercepta requests inválidos e retorna 400 automaticamente
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegistroClienteValidator>();

// Shared Kernel: reutiliza o banco de dados do CRM
builder.Services.AddDbContext<CrmDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddScoped<IDbConnectionFactory, PgSqlConnectionFactory>();

// AutoAtendimento Services
builder.Services.AddScoped<IClienteAuthReadRepository, ClienteAuthReadRepository>();
builder.Services.AddScoped<IVitrineReadRepository, VitrineReadRepository>();
builder.Services.AddScoped<IMeusPedidosReadRepository, MeusPedidosReadRepository>();
builder.Services.AddScoped<ITokenClienteService, TokenClienteService>();
builder.Services.AddScoped<IEmailService, ConsoleEmailService>();

// Shared Kernel: reutiliza repositórios de escrita do CRM
builder.Services.AddScoped<IPedidoWriteRepository, PedidoWriteRepository>();

// JWT Bearer
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AutoAtendimento API v1"));
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
