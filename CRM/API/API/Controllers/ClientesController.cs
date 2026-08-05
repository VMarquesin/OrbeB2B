using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientesController : ControllerBase
{
    private readonly IClienteReadRepository _readRepository;
    private readonly IClienteWriteRepository _writeRepository;

    public ClientesController(IClienteReadRepository readRepository,
                              IClienteWriteRepository writeRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarClientesDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var clientes = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(clientes);
    }

    [HttpPost]
    public async Task<IActionResult> CriarCliente([FromBody] ClienteCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (await _writeRepository.DocumentoJaCadastradoAsync(empresaId, request.Documento))
            return BadRequest(new { mensagem = "Este CNPJ já está cadastrado para a sua empresa." });

        var novoCliente = new Cliente(
            empresaId,
            request.CidadeId,
            request.Documento,
            request.NomeOuRazaoSocial,
            request.NomeFantasia,
            request.TipoSegmento,
            request.Cep,
            request.Logradouro,
            request.Numero,
            request.Bairro
        );

        await _writeRepository.CadastrarClienteAsync(novoCliente);

        return StatusCode(201, new { mensagem = "Cliente cadastrado com sucesso!", id = novoCliente.Id });
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> AtualizarStatusCliente(Guid id, [FromBody] AtualizarStatusClienteRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid(); 

        var cliente = await _writeRepository.ObterPorIdEEmpresaAsync(id, empresaId);

        if (cliente is null)
            return NotFound(new { mensagem = "Cliente não encontrado." });

        cliente.AtualizarStatusCadastro(request.Status);

        await _writeRepository.AtualizarAsync(cliente);

        return Ok(new { mensagem = "Status do cliente atualizado com sucesso." });
    }
}
