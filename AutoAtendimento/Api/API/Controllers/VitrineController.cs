using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.Repositories;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/vitrine")]
public class VitrineController : ControllerBase
{
    private readonly IVitrineReadRepository _repository;

    public VitrineController(IVitrineReadRepository repository)
    {
        _repository = repository;
    }

    // ── Rota autenticada ─────────────────────────────────────────────────────
    [Authorize(Roles = "CompradorB2B")]
    [HttpGet("produtos")]
    public async Task<IActionResult> ObterProdutos()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var produtos = await _repository.ObterProdutosAtivosAsync(empresaId);

        return Ok(produtos);
    }

    // ── Rota pública (landing page, carrossel, catálogo público) ─────────────
    [AllowAnonymous]
    [HttpGet("produtos-publicos")]
    public async Task<IActionResult> ObterProdutosPublicos([FromQuery] Guid? empresaId = null)
    {
        var produtos = await _repository.ObterProdutosAtivosPublicosAsync(empresaId);
        return Ok(produtos);
    }

    // ── Rota de detalhe de produto (pública e autenticada) ───────────────────
    [AllowAnonymous]
    [HttpGet("produtos/{id:guid}")]
    public async Task<IActionResult> ObterProdutoPorId(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        Guid? empresaId = Guid.TryParse(tenantIdClaim, out var parsedId) ? parsedId : null;

        var produto = await _repository.ObterProdutoPorIdAsync(id, empresaId);

        if (produto is null)
            return NotFound(new { mensagem = "Produto não encontrado." });

        return Ok(produto);
    }
}
