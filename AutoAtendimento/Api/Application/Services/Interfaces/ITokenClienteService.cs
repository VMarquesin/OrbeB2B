using OrbeB2B.AutoAtendimento.Application.Models;

namespace OrbeB2B.AutoAtendimento.Application.Services.Interfaces;

public interface ITokenClienteService
{
    string GerarToken(CompradorAuthModel comprador);
    string GerarTokenVerificacaoEmail(Guid usuarioId);
}
