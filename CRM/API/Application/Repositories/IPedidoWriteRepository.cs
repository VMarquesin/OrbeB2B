using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IPedidoWriteRepository
{
    Task GravarPedidoCompletoAsync(Pedido pedido);
    Task<Pedido?> ObterPorIdEEmpresaAsync(Guid id, Guid empresaId);
    Task AtualizarAsync(Pedido pedido);
}
