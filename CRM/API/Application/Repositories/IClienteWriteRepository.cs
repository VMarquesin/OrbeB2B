using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IClienteWriteRepository
{
    Task<bool> DocumentoJaCadastradoAsync(Guid empresaId, string documento);
    Task CadastrarClienteAsync(Cliente cliente);
    Task<Cliente?> ObterPorIdEEmpresaAsync(Guid id, Guid empresaId);
    Task AtualizarAsync(Cliente cliente);
}
