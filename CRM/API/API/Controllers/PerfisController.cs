using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/perfis")]
[Authorize]
public class PerfisController : ControllerBase
{
    private readonly IPerfilReadRepository _readRepository;
    private readonly IPerfilWriteRepository _writeRepository;
    private readonly IUsuarioReadRepository _usuarioReadRepository;

    public PerfisController(
        IPerfilReadRepository readRepository,
        IPerfilWriteRepository writeRepository,
        IUsuarioReadRepository usuarioReadRepository)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
        _usuarioReadRepository = usuarioReadRepository;
    }

    [HttpGet]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> ObterPerfis()
    {
        var perfis = await _readRepository.ObterPerfisAsync();

        return Ok(perfis);
    }

    [HttpGet("{perfilId:guid}/permissoes")]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> ObterPermissoes(Guid perfilId)
    {
        var permissoes = await _readRepository.ObterPermissoesPorPerfilAsync(perfilId);

        return Ok(permissoes);
    }
   [HttpGet("minhas-permissoes")]
public async Task<IActionResult> ObterMinhasPermissoes()
{
    var usuarioIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(usuarioIdClaim) ||
        !Guid.TryParse(usuarioIdClaim, out var usuarioId))
        return Forbid();

    var permissoesIndividuais =
        await _usuarioReadRepository.ObterPermissoesPorUsuarioAsync(usuarioId);

    if (permissoesIndividuais.Any())
    {
        return Ok(
            permissoesIndividuais.Select(area => new
            {
                area
            })
        );
    }

    var perfilIdClaim = User.FindFirst("PerfilId")?.Value;

    if (string.IsNullOrEmpty(perfilIdClaim) ||
        !Guid.TryParse(perfilIdClaim, out var perfilId))
        return Forbid();

    var permissoesPerfil =
        await _readRepository.ObterPermissoesPorPerfilAsync(perfilId);

    return Ok(permissoesPerfil);
}
    [HttpPost]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> CriarPerfil([FromBody] PerfilCreateRequest request)
    {
        if (await _writeRepository.NomePerfilJaCadastradoAsync(request.NomePerfil))
            return BadRequest(new { mensagem = "Este perfil já está cadastrado." });

        var perfil = new PerfilUsuario(
            request.NomePerfil,
            request.Descricao,
            request.Sistema
        );

        var permissoes = request.Areas
            .Distinct()
            .Select(area => new PermissaoPerfil(
                perfil.Id,
                area
            ))
            .ToList();

        await _writeRepository.CadastrarPerfilAsync(perfil, permissoes);

        return StatusCode(201, new
        {
            mensagem = "Perfil criado com sucesso.",
            perfilId = perfil.Id
        });
    }
    }