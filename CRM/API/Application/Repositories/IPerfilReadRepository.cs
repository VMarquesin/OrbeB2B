using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IPerfilReadRepository
{
    Task<IEnumerable<PerfilLookupResponse>> ObterPerfisAsync();
    Task<IEnumerable<PermissaoPerfilResponse>> ObterPermissoesPorPerfilAsync(Guid perfilId);
}