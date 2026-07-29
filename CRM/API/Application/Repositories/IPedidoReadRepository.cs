using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IPedidoReadRepository
{
    Task<IEnumerable<PedidoResumoListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId);
}
