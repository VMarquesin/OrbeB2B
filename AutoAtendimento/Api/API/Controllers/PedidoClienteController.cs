using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/pedidos-cliente")]
[Authorize(Roles = "CompradorB2B")]
public class PedidoClienteController : ControllerBase
{
    private readonly IPedidoWriteRepository _writeRepository;

    public PedidoClienteController(IPedidoWriteRepository writeRepository)
    {
        _writeRepository = writeRepository;
    }

    [HttpPost]
    public async Task<IActionResult> CriarPedido([FromBody] PedidoClienteCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        var clienteIdClaim = User.FindFirst("ClienteId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (string.IsNullOrEmpty(clienteIdClaim) || !Guid.TryParse(clienteIdClaim, out var clienteId))
            return Forbid();

        if (request.Itens == null || request.Itens.Count == 0)
            return BadRequest(new { mensagem = "O pedido deve conter ao menos um item." });

        var codigoPedido = Guid.NewGuid().ToString()[..8].ToUpper();

        var novoPedido = new Pedido(
            empresaId,
            clienteId,
            codigoPedido,
            request.ObservacaoNegociacao ?? string.Empty
        );

        foreach (var item in request.Itens)
        {
            novoPedido.AdicionarItem(
                item.ProdutoId,
                item.Quantidade,
                item.PrecoUnitario,
                ehFabricacaoPropriaSnapshot: false
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
}
