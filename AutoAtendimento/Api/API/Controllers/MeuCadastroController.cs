using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Infrastructure.Data;
using System.Security.Claims;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/meu-cadastro")]
[Authorize(Roles = "CompradorB2B")]
public class MeuCadastroController : ControllerBase
{
    private readonly CrmDbContext _context;
    private readonly IDbConnectionFactory _connectionFactory;

    public MeuCadastroController(CrmDbContext context, IDbConnectionFactory connectionFactory)
    {
        _context = context;
        _connectionFactory = connectionFactory;
    }

    [HttpGet("perfil")]
    public async Task<IActionResult> ObterPerfil()
    {
        var clienteIdClaim = User.FindFirst("ClienteId")?.Value;

        if (string.IsNullOrEmpty(clienteIdClaim) || !Guid.TryParse(clienteIdClaim, out var clienteId))
            return Forbid();

        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        Guid.TryParse(usuarioIdClaim, out var usuarioId);

        const string sql = @"
            SELECT 
                COALESCE(u.nome, '') AS Nome,
                COALESCE(c.nome_ou_razao_social, '') AS RazaoSocial,
                COALESCE(c.nome_fantasia, '') AS NomeFantasia,
                COALESCE(c.documento, '') AS Cnpj,
                COALESCE(u.email, '') AS Email,
                '' AS Telefone,
                COALESCE(c.cep, '') AS Cep,
                COALESCE(c.logradouro, '') AS Logradouro,
                COALESCE(c.numero, '') AS Numero,
                COALESCE(c.bairro, '') AS Bairro,
                COALESCE(cid.nome, '') AS Cidade,
                COALESCE(est.sigla, '') AS Uf
            FROM clientes c
            LEFT JOIN usuarios u ON u.cliente_id = c.id
            LEFT JOIN cidades cid ON cid.id = c.cidade_id
            LEFT JOIN estados est ON est.id = cid.estado_id
            WHERE c.id = @ClienteId
              AND (@UsuarioId = '00000000-0000-0000-0000-000000000000'::uuid OR u.id = @UsuarioId OR u.id IS NULL)
            LIMIT 1";

        using var connection = _connectionFactory.CreateConnection();
        var perfil = await connection.QueryFirstOrDefaultAsync<PerfilClienteResponse>(
            sql, new { ClienteId = clienteId, UsuarioId = usuarioId });

        if (perfil is null)
            return NotFound(new { mensagem = "Perfil do cliente não encontrado." });

        return Ok(perfil);
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
