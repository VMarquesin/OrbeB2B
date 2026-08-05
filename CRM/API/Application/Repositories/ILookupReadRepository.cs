using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface ILookupReadRepository
{
    Task<IEnumerable<PerfilLookupResponse>> ObterPerfisAsync();
    Task<IEnumerable<EstadoLookupResponse>> ObterEstadosAsync();
    Task<IEnumerable<CidadeLookupResponse>> ObterCidadesPorEstadoAsync(Guid estadoId);
}
