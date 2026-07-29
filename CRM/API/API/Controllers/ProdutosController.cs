using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProdutosController : ControllerBase
{
    private readonly IProdutoReadRepository _readRepository;
    private readonly IProdutoWriteRepository _writeRepository;

    public ProdutosController(IProdutoReadRepository readRepository,
                              IProdutoWriteRepository writeRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarProdutosDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var produtos = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(produtos);
    }

    [HttpPost]
    public async Task<IActionResult> CriarProduto([FromBody] ProdutoCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (await _writeRepository.CodigoComercialJaCadastradoAsync(empresaId, request.CodigoComercial))
            return BadRequest(new { mensagem = "Este código comercial já está cadastrado para a sua empresa." });

        var novoProduto = new Produto(
            empresaId,
            request.CategoriaId,
            request.CodigoComercial,
            request.Descricao,
            request.Embalagem,
            request.FornecedorId,
            request.EhFabricacaoPropria,
            request.PrecoAtacado,
            request.PrecoLojista,
            request.PrecoVarejo
        );

        await _writeRepository.CadastrarProdutoAsync(novoProduto);

        return StatusCode(201, new { mensagem = "Produto cadastrado com sucesso!", id = novoProduto.Id });
    }
}
