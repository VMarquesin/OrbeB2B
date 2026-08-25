using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Domain.Enums;

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

    public async Task<Cliente?> ObterPorIdEEmpresaAsync(Guid id, Guid empresaId)
    {
        return await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == id && c.EmpresaId == empresaId);
    }

    public async Task AtualizarAsync(Cliente cliente)
    {
        _context.Clientes.Update(cliente);
        await _context.SaveChangesAsync();
    }

    public async Task<Cliente> ObterOuCriarConsumidorFinalAsync(Guid empresaId)
    {
        var documentoPadrao = "00000000000000";
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.EmpresaId == empresaId && c.Documento == documentoPadrao);
            
        if (cliente != null) return cliente;

        var cidade = await _context.Cidades.FirstOrDefaultAsync();
        var cidadeId = cidade?.Id ?? Guid.Empty;

        cliente = new Cliente(
            empresaId: empresaId,
            cidadeId: cidadeId,
            documento: documentoPadrao,
            nomeOuRazaoSocial: "Consumidor Final",
            nomeFantasia: "Consumidor Final",
            tipoSegmento: TipoSegmentoCliente.B2C,
            cep: "00000000",
            logradouro: "Não Informado",
            numero: "S/N",
            bairro: "Não Informado"
        );
        cliente.AtualizarStatusCadastro(StatusCadastroCliente.Aprovado);

        await _context.Clientes.AddAsync(cliente);
        await _context.SaveChangesAsync();

        return cliente;
    }
}
