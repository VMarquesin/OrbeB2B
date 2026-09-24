using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class PerfilWriteRepository : IPerfilWriteRepository
{
    private readonly CrmDbContext _context;

    public PerfilWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> NomePerfilJaCadastradoAsync(string nomePerfil)
    {
        return await _context.PerfisUsuario
            .AnyAsync(p => p.NomePerfil == nomePerfil);
    }

    public async Task CadastrarPerfilAsync(
        PerfilUsuario perfil,
        IEnumerable<PermissaoPerfil> permissoes)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            await _context.PerfisUsuario.AddAsync(perfil);
            await _context.SaveChangesAsync();

            await _context.PermissoesPerfil.AddRangeAsync(permissoes);
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