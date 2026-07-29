using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IFornecedorWriteRepository
{
    Task<bool> CnpjJaCadastradoAsync(Guid empresaId, string cnpj);
    Task CadastrarFornecedorAsync(Fornecedor fornecedor);
}
