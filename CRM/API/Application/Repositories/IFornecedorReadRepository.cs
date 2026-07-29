using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IFornecedorReadRepository
{
    Task<IEnumerable<FornecedorListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId);
}
