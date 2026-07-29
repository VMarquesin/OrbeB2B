using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IProdutoWriteRepository
{
    Task<bool> CodigoComercialJaCadastradoAsync(Guid empresaId, string codigoComercial);
    Task CadastrarProdutoAsync(Produto produto);
}
