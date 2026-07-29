using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IProdutoReadRepository
{
    Task<IEnumerable<ProdutoListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId);
}
