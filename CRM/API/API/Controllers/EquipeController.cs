using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipeController : ControllerBase
{
    private readonly IEmpresaFuncionarioReadRepository _readRepository;

    public EquipeController(IEmpresaFuncionarioReadRepository readRepository)
    {
        _readRepository = readRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarEquipeDaEmpresa()
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var equipe = await _readRepository.ObterEquipePorEmpresaAsync(empresaId);

        return Ok(equipe);
    }
}
