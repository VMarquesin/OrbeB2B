using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.Services.Interfaces;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CepsController : ControllerBase
{
    private readonly IViaCepService _viaCepService;

    public CepsController(IViaCepService viaCepService)
    {
        _viaCepService = viaCepService;
    }

    [HttpGet("{cep}")]
    public async Task<IActionResult> ConsultarCep(string cep)
    {
        var resultado = await _viaCepService.ConsultarCepAsync(cep);

        if (resultado is null)
            return NotFound(new { mensagem = "CEP não encontrado ou inválido." });

        return Ok(resultado);
    }
}
