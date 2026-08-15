using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Enums;
using OrbeB2B.Crm.Infrastructure.Data;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/solicitacoes-endereco")]
[Authorize]
public class SolicitacoesEnderecoController : ControllerBase
{
    private readonly ISolicitacaoEnderecoReadRepository _readRepository;
    private readonly CrmDbContext _context;

    public SolicitacoesEnderecoController(ISolicitacaoEnderecoReadRepository readRepository,
                                           CrmDbContext context)
    {
        _readRepository = readRepository;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] StatusSolicitacao? status)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var solicitacoes = await _readRepository.ObterPorStatusAsync(empresaId, status);

        return Ok(solicitacoes);
    }

    [HttpPost("{id:guid}/aprovar")]
    public async Task<IActionResult> Aprovar(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var solicitacao = await _context.SolicitacoesAlteracaoEndereco
            .FirstOrDefaultAsync(s => s.Id == id);

        if (solicitacao is null)
            return NotFound(new { mensagem = "Solicitação não encontrada." });

        if (solicitacao.Status != StatusSolicitacao.Pendente)
            return BadRequest(new { mensagem = "Apenas solicitações pendentes podem ser aprovadas." });

        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Id == solicitacao.ClienteId && c.EmpresaId == empresaId);

        if (cliente is null)
            return NotFound(new { mensagem = "Cliente associado não encontrado ou não pertence a esta empresa." });

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            solicitacao.Aprovar();

            // Aplica o novo endereço ao cliente via método de domínio existente
            cliente.AtualizarDados(
                cliente.CidadeId,           // CidadeId mantido (campo livre do endereço é Logradouro/CEP/etc)
                cliente.NomeOuRazaoSocial,
                cliente.NomeFantasia,
                cliente.TipoSegmento,
                solicitacao.Cep,
                solicitacao.Logradouro,
                solicitacao.Numero,
                solicitacao.Bairro
            );

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return Ok(new { mensagem = "Solicitação aprovada e endereço do cliente atualizado com sucesso." });
    }

    [HttpPost("{id:guid}/recusar")]
    public async Task<IActionResult> Recusar(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var solicitacao = await _context.SolicitacoesAlteracaoEndereco
            .FirstOrDefaultAsync(s => s.Id == id);

        if (solicitacao is null)
            return NotFound(new { mensagem = "Solicitação não encontrada." });

        if (solicitacao.Status != StatusSolicitacao.Pendente)
            return BadRequest(new { mensagem = "Apenas solicitações pendentes podem ser recusadas." });

        var clientePertenceAoTenant = await _context.Clientes
            .AnyAsync(c => c.Id == solicitacao.ClienteId && c.EmpresaId == empresaId);

        if (!clientePertenceAoTenant)
            return Forbid();

        solicitacao.Recusar();
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "Solicitação recusada." });
    }
}
