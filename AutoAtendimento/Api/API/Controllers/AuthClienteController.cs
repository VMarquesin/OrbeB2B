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

    /// <summary>
    /// Login do comprador B2B via CNPJ da empresa + senha pessoal.
    /// O CNPJ identifica o cliente; a senha valida o usuário vinculado.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginClienteRequest request)
    {
        // 1. Limpeza rigorosa da máscara do CNPJ
        var cnpjLimpo = request.Cnpj?
            .Replace(".", "")
            .Replace("/", "")
            .Replace("-", "")
            .Trim();

        if (string.IsNullOrEmpty(cnpjLimpo))
            return BadRequest(new { mensagem = "CNPJ não informado." });

        // 2. Busca pelo CNPJ limpo
        var comprador = await _authRepository.ObterCompradorPorCnpjAsync(cnpjLimpo);

        // Mensagem genérica — não revela se o CNPJ existe ou não (prevenção de user enumeration)
        if (comprador is null)
            return Unauthorized(new { mensagem = "CNPJ ou senha inválidos. Verifique suas credenciais." });

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, comprador.SenhaHash))
            return Unauthorized(new { mensagem = "CNPJ ou senha inválidos. Verifique suas credenciais." });

        if (!comprador.EstaAtivo)
            return StatusCode(403, new { mensagem = "Acesso bloqueado. Contate seu fornecedor." });

        var token = _tokenService.GerarToken(comprador);

        var response = new LoginClienteResponse(
            Token:      token,
            UsuarioId:  comprador.Id,
            Nome:       comprador.Nome,
            ClienteId:  comprador.ClienteId,
            NomeCliente: comprador.NomeCliente,
            EmpresaId:  comprador.EmpresaId
        );

        return Ok(response);
    }
}
