using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class CategoriaWriteRepository : ICategoriaWriteRepository
{
    private readonly CrmDbContext _context;

    public CategoriaWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> NomeJaCadastradoAsync(Guid empresaId, string nome)
    {
        return await _context.Categorias
            .AnyAsync(c => c.EmpresaId == empresaId && c.Nome == nome);
    }

    public async Task CadastrarCategoriaAsync(Categoria categoria)
    {
        await _context.Categorias.AddAsync(categoria);
        await _context.SaveChangesAsync();
    }
}
