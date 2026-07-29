using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class FornecedorWriteRepository : IFornecedorWriteRepository
{
    private readonly CrmDbContext _context;

    public FornecedorWriteRepository(CrmDbContext context)
    {
        _context = context;
    }

    public async Task<bool> CnpjJaCadastradoAsync(Guid empresaId, string cnpj)
    {
        return await _context.Fornecedores
            .AnyAsync(f => f.EmpresaId == empresaId && f.Cnpj == cnpj);
    }

    public async Task CadastrarFornecedorAsync(Fornecedor fornecedor)
    {
        await _context.Fornecedores.AddAsync(fornecedor);
        await _context.SaveChangesAsync();
    }
}
