using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Infrastructure.Data;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/meu-cadastro")]
[Authorize(Roles = "CompradorB2B")]
public class MeuCadastroController : ControllerBase
{
    private readonly CrmDbContext _context;

    public MeuCadastroController(CrmDbContext context)
    {
        _context = context;
    }

    [HttpPost("solicitar-alteracao-endereco")]
    public async Task<IActionResult> SolicitarAlteracaoEndereco([FromBody] SolicitacaoEnderecoCreateRequest request)
    {
        var clienteIdClaim = User.FindFirst("ClienteId")?.Value;

        if (string.IsNullOrEmpty(clienteIdClaim) || !Guid.TryParse(clienteIdClaim, out var clienteId))
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Motivo))
            return BadRequest(new { mensagem = "O motivo da solicitação é obrigatório." });

        var solicitacao = new SolicitacaoAlteracaoEndereco(
            clienteId,
            request.Cep,
            request.Uf,
            request.Cidade,
            request.Bairro,
            request.Logradouro,
            request.Numero,
            request.Complemento,
            request.Motivo
        );

        await _context.SolicitacoesAlteracaoEndereco.AddAsync(solicitacao);
        await _context.SaveChangesAsync();

        return StatusCode(201, new
        {
            mensagem = "Solicitação enviada com sucesso! Nossa equipe comercial entrará em contato.",
            id = solicitacao.Id
        });
    }
}
