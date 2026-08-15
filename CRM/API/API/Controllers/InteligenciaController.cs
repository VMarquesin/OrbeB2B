using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/inteligencia")]
[Authorize]
public class InteligenciaController : ControllerBase
{
    private readonly IInteligenciaReadRepository _repository;

    public InteligenciaController(IInteligenciaReadRepository repository)
    {
        _repository = repository;
    }

    private Guid? ObterTenantId()
    {
        var claim = User.FindFirst("TenantId")?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    /// <summary>
    /// Dashboard principal com KPIs de receita, carteira ativa e top produtos.
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var tenantId = ObterTenantId();
        if (tenantId is null) return Forbid();

        var resultado = await _repository.ObterDashboardPrincipalAsync(tenantId.Value);
        return Ok(resultado);
    }

    /// <summary>
    /// Histórico de faturamento com filtro de período.
    /// </summary>
    [HttpGet("faturamento")]
    public async Task<IActionResult> Faturamento(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim)
    {
        var tenantId = ObterTenantId();
        if (tenantId is null) return Forbid();

        var resultado = await _repository.ObterHistoricoFaturamentoAsync(tenantId.Value, dataInicio, dataFim);
        return Ok(resultado);
    }

    /// <summary>
    /// Análise de Curva ABC (Pareto) dos produtos mais vendidos.
    /// </summary>
    [HttpGet("curva-abc")]
    public async Task<IActionResult> CurvaAbc()
    {
        var tenantId = ObterTenantId();
        if (tenantId is null) return Forbid();

        var resultado = await _repository.ObterCurvaAbcProdutosAsync(tenantId.Value);
        return Ok(resultado);
    }
}
