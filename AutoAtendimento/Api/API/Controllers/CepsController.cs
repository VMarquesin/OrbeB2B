using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Api.Services;

namespace OrbeB2B.AutoAtendimento.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class CepsController : ControllerBase
{
    private readonly ViaCepService _viaCepService;

    public CepsController(ViaCepService viaCepService)
    {
        _viaCepService = viaCepService;
    }

    [HttpGet("{cep}")]
    public async Task<IActionResult> ConsultarCep(string cep)
    {
        var resultado = await _viaCepService.ConsultarCepAsync(cep);

        if (resultado is null)
            return NotFound(new
            {
                mensagem = "CEP não foi encontrado ou inválido."
            });

        if (resultado.CidadeId is null)
            return UnprocessableEntity(new
            {
                mensagem = "O CEP foi encontrado, mas a cidade não está cadastrada na base."
            });

        return Ok(resultado);
    }
}
