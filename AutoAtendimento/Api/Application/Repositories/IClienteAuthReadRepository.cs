using OrbeB2B.AutoAtendimento.Application.Models;

namespace OrbeB2B.AutoAtendimento.Application.Repositories;

public interface IClienteAuthReadRepository
{
    Task<CompradorAuthModel?> ObterCompradorParaLoginAsync(string email);
}
