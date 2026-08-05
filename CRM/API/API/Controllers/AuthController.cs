using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Application.Services.Interfaces;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthReadRepository _authReadRepository;
    private readonly ITokenService _tokenService;

    public AuthController(IAuthReadRepository authReadRepository, ITokenService tokenService)
    {
        _authReadRepository = authReadRepository;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _authReadRepository.ObterUsuarioParaLoginAsync(request.Email);

        if (usuario is null)
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        if (!usuario.EstaAtivo)
            return StatusCode(403, new { mensagem = "Usuário inativo. Contate o administrador." });

        var token = _tokenService.GerarToken(usuario);

        var response = new LoginResponse(
            Token: token,
            UsuarioId: usuario.Id,
            Nome: usuario.Nome,
            Email: usuario.Email,
            EmpresaId: usuario.EmpresaId,
            Perfil: usuario.NomePerfil
        );

        return Ok(response);
    }
}