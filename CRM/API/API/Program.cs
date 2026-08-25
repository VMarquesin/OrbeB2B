using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OrbeB2B.Crm.API.Middlewares;
using OrbeB2B.Crm.API.Validators;
using OrbeB2B.Crm.Application.Services.Interfaces;
using OrbeB2B.Crm.Infrastructure.Data;
using OrbeB2B.Crm.Infrastructure.Identity;
using OrbeB2B.Crm.Infrastructure.Services;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Infrastructure.Data.Repositories;
using System.Text;

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
var builder = WebApplication.CreateBuilder(args);

// Configuração do Banco de Dados
builder.Services.AddDbContext<CrmDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

#if DEBUG
// Serviço de Seed/Reset — apenas em desenvolvimento
builder.Services.AddScoped<DatabaseDevService>();
#endif

// Injeção de Dependência dos Serviços de Identidade
builder.Services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddScoped<IDbConnectionFactory, PgSqlConnectionFactory>();

builder.Services.AddScoped<IAuthReadRepository, AuthReadRepository>();
builder.Services.AddScoped<ILookupReadRepository, LookupReadRepository>();

builder.Services.AddScoped<IUsuarioReadRepository, UsuarioReadRepository>();
builder.Services.AddScoped<IUsuarioWriteRepository, UsuarioWriteRepository>();

builder.Services.AddScoped<IEmpresaReadRepository, EmpresaReadRepository>();
builder.Services.AddScoped<IEmpresaWriteRepository, EmpresaWriteRepository>();

builder.Services.AddScoped<IEmpresaFuncionarioReadRepository, EmpresaFuncionarioReadRepository>();

builder.Services.AddScoped<IClienteReadRepository, ClienteReadRepository>();
builder.Services.AddScoped<IClienteWriteRepository, ClienteWriteRepository>();

builder.Services.AddScoped<ICategoriaReadRepository, CategoriaReadRepository>();
builder.Services.AddScoped<ICategoriaWriteRepository, CategoriaWriteRepository>();

builder.Services.AddScoped<IFornecedorReadRepository, FornecedorReadRepository>();
builder.Services.AddScoped<IFornecedorWriteRepository, FornecedorWriteRepository>();

builder.Services.AddScoped<IProdutoReadRepository, ProdutoReadRepository>();
builder.Services.AddScoped<IProdutoWriteRepository, ProdutoWriteRepository>();

builder.Services.AddScoped<IPedidoReadRepository, PedidoReadRepository>();
builder.Services.AddScoped<IPedidoWriteRepository, PedidoWriteRepository>();

builder.Services.AddScoped<ISolicitacaoEnderecoReadRepository, SolicitacaoEnderecoReadRepository>();
builder.Services.AddScoped<IInteligenciaReadRepository, InteligenciaReadRepository>();

// Configuração do JWT Bearer
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
        };
    });

builder.Services.AddAuthorization();

// FluentValidation: intercepta requests inválidos → retorna 400 automaticamente
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<ClienteCreateRequestValidator>();

// Prepara o motor de endpoints baseados em classes (Controllers)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Define que o Swagger vai usar autenticação baseada no cabeçalho (Header) "Authorization"
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT desta maneira: Bearer {seu token}"
    });

    // Aplica essa regra de segurança em todos os endpoints que exigirem
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

// HttpClient para integração com ViaCEP
builder.Services.AddScoped<IViaCepService, ViaCepService>();
builder.Services.AddHttpClient<ViaCepService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontEnd", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

// === CONFIGURAÇÃO DO PIPELINE HTTP ===

// DEVE ser o primeiro middleware — captura exceções de todo o pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("PermitirFrontEnd");
app.UseHttpsRedirection();
app.UseAuthentication(); // usuário
app.UseAuthorization();  // Verifica O QUE pode acessar (Perfil)
app.MapControllers(); 

app.Run();