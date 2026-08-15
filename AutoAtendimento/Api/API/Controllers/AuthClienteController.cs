using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.AutoAtendimento.Application.Repositories;
using OrbeB2B.AutoAtendimento.Application.Services.Interfaces;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/auth-cliente")]
[AllowAnonymous]
public class AuthClienteController : ControllerBase
{
    private readonly IClienteAuthReadRepository _authRepository;
    private readonly ITokenClienteService _tokenService;

    public AuthClienteController(IClienteAuthReadRepository authRepository,
                                 ITokenClienteService tokenService)
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginClienteRequest request)
    {
        var comprador = await _authRepository.ObterCompradorParaLoginAsync(request.Email);

        if (comprador is null)
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, comprador.SenhaHash))
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        if (!comprador.EstaAtivo)
            return StatusCode(403, new { mensagem = "Acesso bloqueado. Contate o seu fornecedor." });

        var token = _tokenService.GerarToken(comprador);

        var response = new LoginClienteResponse(
            Token: token,
            UsuarioId: comprador.Id,
            Nome: comprador.Nome,
            ClienteId: comprador.ClienteId,
            NomeCliente: comprador.NomeCliente,
            EmpresaId: comprador.EmpresaId
        );

        return Ok(response);    
    }
}
