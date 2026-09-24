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
            .Include(p => p.Imagens)
            .FirstOrDefaultAsync(p => p.Id == id && p.EmpresaId == empresaId);
    }
   public async Task AtualizarAsync(Produto produto)
{
    var imagensNovas = produto.Imagens.ToList();

    foreach (var entry in _context.ChangeTracker
        .Entries<ProdutoImagem>()
        .ToList())
    {
        entry.State = EntityState.Detached;
    }

    await _context.ProdutoImagens
        .Where(i => i.ProdutoId == produto.Id)
        .ExecuteDeleteAsync();

    await _context.SaveChangesAsync();

    await _context.ProdutoImagens.AddRangeAsync(imagensNovas);

    await _context.SaveChangesAsync();
    } 
}
