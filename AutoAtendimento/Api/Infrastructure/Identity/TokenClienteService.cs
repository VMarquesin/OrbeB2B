using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OrbeB2B.AutoAtendimento.Application.Models;
using OrbeB2B.AutoAtendimento.Application.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OrbeB2B.AutoAtendimento.Infrastructure.Identity;

public class TokenClienteService : ITokenClienteService
{
    private readonly IConfiguration _configuration;

    public TokenClienteService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GerarToken(CompradorAuthModel comprador)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, comprador.Id.ToString()),
            new Claim(ClaimTypes.Email, comprador.Email),
            new Claim(ClaimTypes.Role, "CompradorB2B"),
            new Claim("ClienteId", comprador.ClienteId.ToString()),
            new Claim("TenantId", comprador.EmpresaId.ToString())
        };

        return CriarJwt(claims, expiraEmHoras: 8);
    }

    public string GerarTokenVerificacaoEmail(Guid usuarioId)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),
            new Claim("action", "VerifyEmail")
        };

        return CriarJwt(claims, expiraEmHoras: 24);
    }

    private string CriarJwt(List<Claim> claims, int expiraEmHoras)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(expiraEmHoras),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
