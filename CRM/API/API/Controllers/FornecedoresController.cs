using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FornecedoresController : ControllerBase
{
    private readonly IFornecedorReadRepository _readRepository;
    private readonly IFornecedorWriteRepository _writeRepository;

    public FornecedoresController(IFornecedorReadRepository readRepository,
                                  IFornecedorWriteRepository writeRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarFornecedoresDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var fornecedores = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(fornecedores);
    }

    [HttpPost]
    public async Task<IActionResult> CriarFornecedor([FromBody] FornecedorCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (await _writeRepository.CnpjJaCadastradoAsync(empresaId, request.Cnpj))
            return BadRequest(new { mensagem = "Este CNPJ já está cadastrado para a sua empresa." });

        var novoFornecedor = new Fornecedor(empresaId, request.Cnpj, request.RazaoSocial);

        await _writeRepository.CadastrarFornecedorAsync(novoFornecedor);

        return StatusCode(201, new { mensagem = "Fornecedor cadastrado com sucesso!", id = novoFornecedor.Id });
    }
}
