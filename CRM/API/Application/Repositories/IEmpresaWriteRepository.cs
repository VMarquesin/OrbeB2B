using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IEmpresaWriteRepository
{
    Task<bool> CnpjJaCadastradoAsync(string cnpj);
    Task CadastrarEmpresaAsync(Empresa empresa);
}
