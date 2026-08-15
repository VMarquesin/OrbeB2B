using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class ProdutoWriteRepository : IProdutoWriteRepository
{
    private readonly CrmDbContext _context;

    public ProdutoWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CodigoComercialJaCadastradoAsync(Guid empresaId, string codigoComercial)
    {
        return await _context.Produtos
            .AnyAsync(p => p.EmpresaId == empresaId && p.CodigoComercial == codigoComercial);
    }

    public async Task CadastrarProdutoAsync(Produto produto)
    {
        await _context.Produtos.AddAsync(produto);
        await _context.SaveChangesAsync();
    }

    public async Task<Produto?> ObterPorIdEEmpresaAsync(Guid id, Guid empresaId)
    {
        return await _context.Produtos
            .FirstOrDefaultAsync(p => p.Id == id && p.EmpresaId == empresaId);
    }

    public async Task AtualizarAsync(Produto produto)
    {
        _context.Produtos.Update(produto);
        await _context.SaveChangesAsync();
    }
}
