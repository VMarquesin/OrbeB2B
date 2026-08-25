using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly IPedidoReadRepository _readRepository;
    private readonly IPedidoWriteRepository _writeRepository;
    private readonly IClienteWriteRepository _clienteWriteRepository;

    public PedidosController(IPedidoReadRepository readRepository,
                             IPedidoWriteRepository writeRepository,
                             IClienteWriteRepository clienteWriteRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
        _clienteWriteRepository = clienteWriteRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarPedidosDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var pedidos = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(pedidos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterDetalhePedido(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var pedido = await _readRepository.ObterDetalhePorIdAsync(id, empresaId);

        if (pedido is null)
            return NotFound(new { mensagem = "Pedido não encontrado." });

        return Ok(pedido);
    }

    [HttpPost]
    public async Task<IActionResult> CriarPedido([FromBody] PedidoCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (request.Itens == null || request.Itens.Count == 0)
            return BadRequest(new { mensagem = "O pedido deve conter ao menos um item." });

        var codigoPedido = Guid.NewGuid().ToString()[..8].ToUpper();

        // Se ClienteId for informado → pedido B2B / manual com cliente cadastrado
        // Se ClienteId for null    → pedido de Pessoa Física (Consumidor Final)
        Guid clienteIdParaVincular;

        if (request.ClienteId.HasValue && request.ClienteId.Value != Guid.Empty)
        {
            clienteIdParaVincular = request.ClienteId.Value;
        }
        else
        {
            var consumidorFinal = await _clienteWriteRepository.ObterOuCriarConsumidorFinalAsync(empresaId);
            clienteIdParaVincular = consumidorFinal.Id;
        }

        var novoPedido = new Pedido(empresaId, clienteIdParaVincular, codigoPedido, request.ObservacaoNegociacao ?? string.Empty);

        foreach (var item in request.Itens)
        {
            novoPedido.AdicionarItem(
                item.ProdutoId,
                item.Quantidade,
                item.PrecoUnitario,
                item.EhFabricacaoPropriaSnapshot
            );
        }

        await _writeRepository.GravarPedidoCompletoAsync(novoPedido);

        return StatusCode(201, new
        {
            mensagem = "Pedido registrado com sucesso!",
            id = novoPedido.Id,
            codigo = codigoPedido,
            valorTotal = novoPedido.ValorTotalPedido
        });
    }

    [HttpPatch("{id:guid}/status-logistica")]
    public async Task<IActionResult> AtualizarStatusLogistica(Guid id, [FromBody] AtualizarStatusLogisticaPedidoRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var pedido = await _writeRepository.ObterPorIdEEmpresaAsync(id, empresaId);

        if (pedido is null)
            return NotFound(new { mensagem = "Pedido não encontrado." });

        pedido.AtualizarStatusLogistica(request.Status);

        await _writeRepository.AtualizarAsync(pedido);

        return Ok(new { mensagem = "Status logístico do pedido atualizado com sucesso." });
    }

    [HttpPatch("{id:guid}/status-erp")]
    public async Task<IActionResult> AtualizarStatusErp(Guid id, [FromBody] AtualizarStatusErpPedidoRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var pedido = await _writeRepository.ObterPorIdEEmpresaAsync(id, empresaId);

        if (pedido is null)
            return NotFound(new { mensagem = "Pedido não encontrado." });

        pedido.AtualizarStatusErp(request.Status);

        await _writeRepository.AtualizarAsync(pedido);

        return Ok(new { mensagem = "Status ERP do pedido atualizado com sucesso." });
    }
}
