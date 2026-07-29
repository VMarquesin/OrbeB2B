using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface ICategoriaWriteRepository
{
    Task<bool> NomeJaCadastradoAsync(Guid empresaId, string nome);
    Task CadastrarCategoriaAsync(Categoria categoria);
}
