namespace OrbeB2B.AutoAtendimento.Application.Services.Interfaces;

public interface IEmailService
{
    Task EnviarEmailConfirmacaoAsync(string emailDestino, string linkConfirmacao);
}
