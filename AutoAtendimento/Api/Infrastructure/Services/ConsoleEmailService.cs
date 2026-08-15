using OrbeB2B.AutoAtendimento.Application.Services.Interfaces;

namespace OrbeB2B.AutoAtendimento.Infrastructure.Services;

public class ConsoleEmailService : IEmailService
{
    public Task EnviarEmailConfirmacaoAsync(string emailDestino, string linkConfirmacao)
    {
        Console.WriteLine("==================================================");
        Console.WriteLine($"[MOCK E-MAIL] Para: {emailDestino}");
        Console.WriteLine($"[MOCK E-MAIL] Assunto: Confirme seu cadastro na OrbeB2B");
        Console.WriteLine($"[MOCK E-MAIL] Link de confirmação: {linkConfirmacao}");
        Console.WriteLine("==================================================");

        return Task.CompletedTask;
    }
}
