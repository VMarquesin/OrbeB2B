using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.AutoAtendimento.Application.Services.Interfaces;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Domain.Enums;
using OrbeB2B.Crm.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OrbeB2B.AutoAtendimento.API.Controllers;

[ApiController]
[Route("api/registro")]
[AllowAnonymous]
public class RegistroClienteController : ControllerBase
{
    private readonly CrmDbContext _context;
    private readonly ITokenClienteService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public RegistroClienteController(CrmDbContext context,
                                      ITokenClienteService tokenService,
                                      IEmailService emailService,
                                      IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistroClienteRequest request)
    {
        // EmpresaId lido de appsettings — nunca do payload (estratégia SaaS segura)
        var empresaIdConfig = _configuration["SaaS:MatrizEmpresaId"];
        if (!Guid.TryParse(empresaIdConfig, out var empresaId))
            return StatusCode(503, new { mensagem = "Portal temporariamente indisponível. Contate o administrador." });

        var emailJaCadastrado = await _context.Usuarios.AnyAsync(u => u.Email == request.EmailAcesso);
        if (emailJaCadastrado)
            return Conflict(new { mensagem = "Este e-mail já está cadastrado." });

        var cnpjJaCadastrado = await _context.Clientes.AnyAsync(c => c.EmpresaId == empresaId && c.Documento == request.Cnpj);
        if (cnpjJaCadastrado)
            return Conflict(new { mensagem = "Este CNPJ já está cadastrado." });

        var perfilComprador = await _context.PerfisUsuario
            .FirstOrDefaultAsync(p => p.NomePerfil == "CompradorB2B");

        if (perfilComprador is null)
            return StatusCode(503, new { mensagem = "Perfil de acesso não configurado. Contate o administrador." });

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var novoCliente = new Cliente(
                empresaId,
                request.CidadeId,
                request.Cnpj,
                request.RazaoSocial,
                request.NomeFantasia,
                TipoSegmentoCliente.B2B,
                request.Cep,
                request.Logradouro,
                request.Numero,
                request.Bairro
            );
            // StatusCadastro = Pendente (valor default do construtor rico)

            var senhaHash = BCrypt.Net.BCrypt.HashPassword(request.SenhaAcesso);

            var novoUsuario = new Usuario(
                perfilComprador.Id,
                request.RazaoSocial,
                request.EmailAcesso,
                senhaHash,
                novoCliente.Id
            );
            novoUsuario.Inativar(); // EstaAtivo = false até confirmar e-mail

            await _context.Clientes.AddAsync(novoCliente);
            await _context.Usuarios.AddAsync(novoUsuario);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            var tokenVerificacao = _tokenService.GerarTokenVerificacaoEmail(novoUsuario.Id);
            var frontBaseUrl = _configuration["SaaS:FrontEndBaseUrl"] ?? "https://front-end.com";
            var linkConfirmacao = $"{frontBaseUrl}/confirmar?token={tokenVerificacao}";

            await _emailService.EnviarEmailConfirmacaoAsync(request.EmailAcesso, linkConfirmacao);

            return StatusCode(201, new
            {
                mensagem = "Cadastro realizado com sucesso! Verifique seu e-mail para ativar o acesso.",
                clienteId = novoCliente.Id
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpGet("confirmar")]
    public async Task<IActionResult> ConfirmarEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new { mensagem = "Token de confirmação não informado." });

        Guid usuarioId;

        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var tokenHandler = new JwtSecurityTokenHandler();

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience = _configuration["Jwt:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            var actionClaim = principal.FindFirst("action")?.Value;
            if (actionClaim != "VerifyEmail")
                return BadRequest(new { mensagem = "Token inválido para esta operação." });

            var sub = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(sub, out usuarioId))
                return BadRequest(new { mensagem = "Token malformado." });
        }
        catch (SecurityTokenExpiredException)
        {
            return BadRequest(new { mensagem = "O link de confirmação expirou. Solicite um novo cadastro." });
        }
        catch
        {
            return BadRequest(new { mensagem = "Token de confirmação inválido." });
        }

        var usuario = await _context.Usuarios.FindAsync(usuarioId);

        if (usuario is null)
            return NotFound(new { mensagem = "Usuário não encontrado." });

        if (usuario.EstaAtivo)
            return Ok(new { mensagem = "E-mail já confirmado anteriormente. Faça o login." });

        usuario.Ativar();
        await _context.SaveChangesAsync();

        return Ok(new { mensagem = "E-mail confirmado com sucesso! Você já pode fazer o login." });
    }
}
