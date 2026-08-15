using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.Repositories;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/vitrine")]
[Authorize(Roles = "CompradorB2B")]
public class VitrineController : ControllerBase
{
    private readonly IVitrineReadRepository _repository;

    public VitrineController(IVitrineReadRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("produtos")]
    public async Task<IActionResult> ObterProdutos()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var produtos = await _repository.ObterProdutosAtivosAsync(empresaId);

        return Ok(produtos);
    }
}
