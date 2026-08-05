using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

namespace OrbeB2B.Crm.API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next,
                                     ILogger<GlobalExceptionMiddleware> logger,
                                     IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exceção não tratada: {Message}", ex.Message);
            await EscreverRespostaDeErroAsync(context, ex);
        }
    }

    private async Task EscreverRespostaDeErroAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var problemDetails = new ProblemDetails
        {
            Status = (int)HttpStatusCode.InternalServerError,
            Title = "Ocorreu um erro interno no servidor.",
            Type = "https://tools.ietf.org/html/rfc7807",
            Instance = context.Request.Path
        };

        // Em desenvolvimento expomos o detalhe; em produção mascaramos
        if (_env.IsDevelopment())
        {
            problemDetails.Detail = ex.Message;
            problemDetails.Extensions["stackTrace"] = ex.StackTrace;
        }
        else
        {
            problemDetails.Detail = "Entre em contato com o suporte se o problema persistir.";
        }

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
