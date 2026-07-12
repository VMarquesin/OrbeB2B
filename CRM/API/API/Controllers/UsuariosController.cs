using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioReadRepository _readRepository;

    public UsuariosController(IUsuarioReadRepository readRepository)
    {
        _readRepository = readRepository;
    }

    [HttpGet]
    public async Task<IActionResult> ListarUsuariosDaEmpresa()
    {
        // A MÁGICA DO MULTI-TENANT: 
        // O usuário NÃO envia o ID da empresa dele. Nós roubamos o ID de dentro do Token JWT.
        // Assim, é fisicamente impossível um hacker listar usuários da empresa vizinha.
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid("Sua sessão não possui uma empresa atrelada.");
            
        var usuarios = await _readRepository.ObterTodosPorEmpresaAsync(empresaId);

        return Ok(usuarios);
    }
}