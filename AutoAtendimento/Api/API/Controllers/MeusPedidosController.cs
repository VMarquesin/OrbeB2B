using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.Repositories;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/meus-pedidos")]
[Authorize(Roles = "CompradorB2B")]
public class MeusPedidosController : ControllerBase
{
    private readonly IMeusPedidosReadRepository _repository;

    public MeusPedidosController(IMeusPedidosReadRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> ObterHistorico()
    {
        var clienteIdClaim = User.FindFirst("ClienteId")?.Value;

        if (string.IsNullOrEmpty(clienteIdClaim) || !Guid.TryParse(clienteIdClaim, out var clienteId))
            return Forbid();

        var pedidos = await _repository.ObterHistoricoAsync(clienteId);

        return Ok(pedidos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterDetalhes(Guid id)
    {
        var clienteIdClaim = User.FindFirst("ClienteId")?.Value;

        if (string.IsNullOrEmpty(clienteIdClaim) || !Guid.TryParse(clienteIdClaim, out var clienteId))
            return Forbid();

        var pedido = await _repository.ObterDetalhesAsync(id, clienteId);

        if (pedido is null)
            return NotFound(new { mensagem = "Pedido não encontrado." });

        return Ok(pedido);
    }

    [HttpGet("{id:guid}/recompra")]
    public async Task<IActionResult> ObterSimulacaoRecompra(Guid id)
    {
        var clienteIdClaim = User.FindFirst("ClienteId")?.Value;

        if (string.IsNullOrEmpty(clienteIdClaim) || !Guid.TryParse(clienteIdClaim, out var clienteId))
            return Forbid();

        var itens = await _repository.ObterSimulacaoRecompraAsync(id, clienteId);

        if (!itens.Any())
            return NotFound(new { mensagem = "Pedido não encontrado ou sem itens." });

        return Ok(itens);
    }
}
