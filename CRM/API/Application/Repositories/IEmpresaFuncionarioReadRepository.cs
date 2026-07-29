using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IEmpresaFuncionarioReadRepository
{
    Task<IEnumerable<FuncionarioListResponse>> ObterEquipePorEmpresaAsync(Guid empresaId);
}
