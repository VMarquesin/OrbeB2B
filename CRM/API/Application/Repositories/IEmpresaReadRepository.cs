using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IEmpresaReadRepository
{
    Task<IEnumerable<EmpresaListResponse>> ObterTodasAsync();
}
