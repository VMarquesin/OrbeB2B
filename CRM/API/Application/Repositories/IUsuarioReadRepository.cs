using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IUsuarioReadRepository
{
    Task<IEnumerable<UsuarioListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId);
}