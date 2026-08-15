#if DEBUG
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Infrastructure.Data;

namespace OrbeB2B.Crm.API.Controllers;

/// <summary>
/// ATENÇÃO: Este controller SÓ EXISTE em modo DEBUG.
/// Ele é completamente removido do build de Produção pela diretiva #if DEBUG.
/// </summary>
[ApiController]
[Route("api/dev")]
[AllowAnonymous]
public class DevController : ControllerBase
{
    private readonly DatabaseDevService _devService;

    public DevController(DatabaseDevService devService)
    {
        _devService = devService;
    }

    /// <summary>
    /// Popula o banco com dados fake realistas para testes de BI e Dashboard.
    /// Roda apenas uma vez — idempotente (trava se banco já tiver dados).
    /// </summary>
    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        try
        {
            await _devService.PopularBancoAsync();
            return Ok(new { mensagem = "✅ Seed executado com sucesso! Banco populado." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensagem = "Erro ao executar seed.", detalhe = ex.Message });
        }
    }

    /// <summary>
    /// Limpa todos os dados do banco (TRUNCATE CASCADE).
    /// Use antes de rodar o seed novamente para recomeçar do zero.
    /// </summary>
    [HttpDelete("reset")]
    public async Task<IActionResult> Reset()
    {
        try
        {
            await _devService.ResetarBancoAsync();
            return Ok(new { mensagem = "✅ Banco resetado com sucesso! Rode o seed novamente para popular." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { mensagem = "Erro ao resetar banco.", detalhe = ex.Message });
        }
    }
}
#endif
