using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Application.Services.Interfaces;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioReadRepository _readRepository;
    private readonly IUsuarioWriteRepository _writeRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UsuariosController(IUsuarioReadRepository readRepository
                             ,IUsuarioWriteRepository writeRepository
                             ,IPasswordHasher passwordHasher)
    {
        _readRepository = readRepository;
        _writeRepository = writeRepository;
        _passwordHasher = passwordHasher;
    }

    [HttpGet]
    public async Task<IActionResult> ListarUsuariosDaEmpresa([FromQuery] bool incluirInativos = false)
    {
        // O ID é pego no Token JWT.
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid("Sua sessão não possui uma empresa atrelada.");
            
        var usuarios = await _readRepository.ObterTodosPorEmpresaAsync(empresaId, incluirInativos);

        return Ok(usuarios);
    }

    [HttpPost]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> CriarUsuario([FromBody] UsuarioCreateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;

        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid("Erro na validação da empresa.");

        if (await _writeRepository.EmailJaCadastradoAsync(request.Email))
            return BadRequest(new { mensagem = "Este e-mail já está em uso" });

        var senhaCriptografada = _passwordHasher.Hash(request.Senha);
        var novoUsuarioId = Guid.NewGuid();

        var novoUsuario = new Usuario
        (
            request.PerfilId, 
            request.Nome, 
            request.Email, 
            senhaCriptografada
        );

        var novoVinculo = new EmpresaFuncionario
        (
            empresaId,
            novoUsuario.Id,
            request.Cargo,
            request.Departamento
        );

        await _writeRepository.CadastrarUsuarioDaEmpresaAsync(novoUsuario, novoVinculo);

        const string senhaTemporaria = "Mudar@123";
        return StatusCode(201, new { mensagem = "Usuário criado com sucesso!", senhaTemporaria });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> AtualizarColaborador(Guid id, [FromBody] ColaboradorUpdateRequest request)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var (usuario, funcionario) = await _writeRepository.ObterColaboradorPorIdEEmpresaAsync(id, empresaId);

        if (usuario is null || funcionario is null)
            return NotFound(new { mensagem = "Colaborador não encontrado nesta empresa." });

        usuario.AtualizarNome(request.Nome);
        funcionario.AtualizarDados(request.Cargo, request.Departamento);

        await _writeRepository.AtualizarColaboradorAsync(usuario, funcionario);

        return Ok(new { mensagem = "Colaborador atualizado com sucesso." });
    }

    [HttpPatch("{id:guid}/inativar")]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> InativarColaborador(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var (usuario, funcionario) = await _writeRepository.ObterColaboradorPorIdEEmpresaAsync(id, empresaId);

        if (usuario is null || funcionario is null)
            return NotFound(new { mensagem = "Colaborador não encontrado nesta empresa." });

        usuario.Inativar();
        await _writeRepository.AtualizarColaboradorAsync(usuario, funcionario);

        return Ok(new { mensagem = "Colaborador inativado com sucesso." });
    }

    [HttpPatch("{id:guid}/reativar")]
    [Authorize(Roles = "AdminMaster")]
    public async Task<IActionResult> ReativarColaborador(Guid id)
    {
        var tenantIdClaim = User.FindFirst("TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantIdClaim) || !Guid.TryParse(tenantIdClaim, out var empresaId))
            return Forbid();

        var (usuario, funcionario) = await _writeRepository.ObterColaboradorPorIdEEmpresaAsync(id, empresaId);

        if (usuario is null || funcionario is null)
            return NotFound(new { mensagem = "Colaborador não encontrado nesta empresa." });

        usuario.Ativar();
        await _writeRepository.AtualizarColaboradorAsync(usuario, funcionario);

        return Ok(new { mensagem = "Colaborador reativado com sucesso." });
    }
}