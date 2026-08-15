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

    public async Task<(Usuario? usuario, EmpresaFuncionario? funcionario)> ObterColaboradorPorIdEEmpresaAsync(Guid usuarioId, Guid empresaId)
    {
        var usuario = await _context.Usuarios.FindAsync(usuarioId);

        var funcionario = await _context.EmpresaFuncionarios
            .FirstOrDefaultAsync(f => f.UsuarioId == usuarioId && f.EmpresaId == empresaId);

        return (usuario, funcionario);
    }

    public async Task AtualizarColaboradorAsync(Usuario usuario, EmpresaFuncionario funcionario)
    {
        _context.Usuarios.Update(usuario);
        _context.EmpresaFuncionarios.Update(funcionario);
        await _context.SaveChangesAsync();
    }
}