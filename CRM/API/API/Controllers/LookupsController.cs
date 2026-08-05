using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/lookups")]
[Authorize]
public class LookupsController : ControllerBase
{
    private readonly ILookupReadRepository _repository;

    public LookupsController(ILookupReadRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("perfis")]
    public async Task<IActionResult> ObterPerfis()
    {
        var perfis = await _repository.ObterPerfisAsync();
        return Ok(perfis);
    }

    [HttpGet("estados")]
    public async Task<IActionResult> ObterEstados()
    {
        var estados = await _repository.ObterEstadosAsync();
        return Ok(estados);
    }

    [HttpGet("estados/{estadoId:guid}/cidades")]
    public async Task<IActionResult> ObterCidadesPorEstado(Guid estadoId)
    {
        var cidades = await _repository.ObterCidadesPorEstadoAsync(estadoId);
        return Ok(cidades);
    }
}
