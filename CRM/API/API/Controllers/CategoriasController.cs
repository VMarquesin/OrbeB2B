using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriasController : ControllerBase
{
    private readonly ICategoriaReadRepository _readRepository;
    private readonly ICategoriaWriteRepository _writeRepository;

    public CategoriasController(ICategoriaReadRepository readRepository,
                                ICategoriaWriteRepository writeRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarCategoriasDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var categorias = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(categorias);
    }

    [HttpPost]
    public async Task<IActionResult> CriarCategoria([FromBody] CategoriaCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        if (await _writeRepository.NomeJaCadastradoAsync(empresaId, request.Nome))
            return BadRequest(new { mensagem = "Já existe uma categoria com este nome para a sua empresa." });

        var novaCategoria = new Categoria(empresaId, request.Nome);

        await _writeRepository.CadastrarCategoriaAsync(novaCategoria);

        return StatusCode(201, new { mensagem = "Categoria cadastrada com sucesso!", id = novaCategoria.Id });
    }
}
