using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IClienteReadRepository
{
    Task<IEnumerable<ClienteListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId);
}
