using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class UsuarioWriteRepository : IUsuarioWriteRepository
{
    private readonly CrmDbContext _context;

    public UsuarioWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> EmailJaCadastradoAsync(string email)
    {
        return await _context.Usuarios.AnyAsync(u => u.Email == email);
    }

    public async Task CadastrarUsuarioDaEmpresaAsync(Usuario usuario, EmpresaFuncionario vinculo)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();

            await _context.EmpresaFuncionarios.AddAsync(vinculo);
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