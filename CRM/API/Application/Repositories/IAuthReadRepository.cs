using OrbeB2B.Crm.Application.Models;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IAuthReadRepository
{
    Task<UsuarioAuthModel?> ObterUsuarioParaLoginAsync(string email);
}
