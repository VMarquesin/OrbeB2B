using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
// A fechadura principal: Ninguém entra aqui sem um Token JWT válido
[Authorize] 
public class TesteOperacionalController : ControllerBase
{
    [HttpGet("livre-para-logados")]
    public IActionResult TesteLogado()
    {
        return Ok(new { mensagem = "Você tem um token válido, pode passar!" });
    }

    [HttpGet("area-vip")]
    // A fechadura de RBAC: Além do Token, a string no claim "role" TEM que ser AdminMaster
    [Authorize(Roles = "AdminMaster")] 
    public IActionResult TesteAdmin()
    {
        // Aqui é onde a mágica do Multi-Tenant acontece! 
        // Lemos o TenantId diretamente do crachá do usuário, impedindo que ele forje requisições.
        var tenantId = User.FindFirst("TenantId")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        return Ok(new 
        { 
            mensagem = "Acesso de AdminMaster concedido!",
            empresaId = tenantId,
            usuarioLogado = email
        });
    }

    [HttpGet("area-bloqueada")]
    // A fechadura que vai te barrar: Exige uma role que você não tem.
    [Authorize(Roles = "Vendedor")]
    public IActionResult TesteVendedor()
    {
        return Ok(new { mensagem = "Se você ver isso, a segurança falhou." });
    }
}