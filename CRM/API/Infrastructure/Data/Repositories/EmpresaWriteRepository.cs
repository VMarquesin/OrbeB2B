using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class EmpresaWriteRepository : IEmpresaWriteRepository
{
    private readonly CrmDbContext _context;

    public EmpresaWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CnpjJaCadastradoAsync(string cnpj)
    {
        return await _context.Empresas.AnyAsync(e => e.Cnpj == cnpj);
    }

    public async Task CadastrarEmpresaAsync(Empresa empresa)
    {
        await _context.Empresas.AddAsync(empresa);
        await _context.SaveChangesAsync();
    }
}
