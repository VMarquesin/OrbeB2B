using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class PedidoWriteRepository : IPedidoWriteRepository
{
    private readonly CrmDbContext _context;

    public PedidoWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task GravarPedidoCompletoAsync(Pedido pedido)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.Pedidos.AddAsync(pedido);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
