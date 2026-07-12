using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Application.Services.Interfaces;
using OrbeB2B.Crm.Infrastructure.Data;

namespace OrbeB2B.Crm.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly CrmDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    // Injeção de dependências que configuramos no Program.cs
    public AuthController(CrmDbContext context, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Busca o usuário pelo e-mail
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        // Validações de segurança
        if (usuario == null || !usuario.EstaAtivo)
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        // Verifica se o Hash da senha bate com o que o usuário digitou
        if (!_passwordHasher.Verify(request.Senha, usuario.SenhaHash))
            return Unauthorized(new { mensagem = "E-mail ou senha inválidos." });

        // Busca os dados de relacionamento usando os IDs das nossas entidades enxutas
        var perfil = await _context.PerfisUsuario.FindAsync(usuario.PerfilId);
        
        var funcionario = await _context.EmpresaFuncionarios
            .FirstOrDefaultAsync(f => f.UsuarioId == usuario.Id);
            
        var empresa = await _context.Empresas.FindAsync(funcionario!.EmpresaId);

        if (empresa == null || !empresa.EstaAtiva)
            return Unauthorized(new { mensagem = "Empresa inativa ou não encontrada." });

        // O Segurança libera o crachá (Gera o JWT)
        var token = _tokenService.GenerateToken(usuario, empresa, perfil!);

        // Retorna o Token para o front-end salvar no LocalStorage
        return Ok(new 
        { 
            token, 
            usuario = new 
            { 
                id = usuario.Id, 
                nome = usuario.Nome, 
                perfil = perfil!.NomePerfil,
                empresa = empresa.NomeFantasia
            } 
        });
    }
}

// DTO (Data Transfer Object) simples para mapear o JSON de entrada do React
public record LoginRequest(string Email, string Senha);