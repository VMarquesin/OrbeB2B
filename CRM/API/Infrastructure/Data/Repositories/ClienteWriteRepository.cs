using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class ClienteWriteRepository : IClienteWriteRepository
{
    private readonly CrmDbContext _context;

    public ClienteWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> DocumentoJaCadastradoAsync(Guid empresaId, string documento)
    {
        return await _context.Clientes
            .AnyAsync(c => c.EmpresaId == empresaId && c.Documento == documento);
    }

    public async Task CadastrarClienteAsync(Cliente cliente)
    {
        await _context.Clientes.AddAsync(cliente);
        await _context.SaveChangesAsync();
    }
}
