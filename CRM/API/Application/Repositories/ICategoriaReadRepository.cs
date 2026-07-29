using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface ICategoriaReadRepository
{
    Task<IEnumerable<CategoriaListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId);
}
