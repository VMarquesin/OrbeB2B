using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Services.Interfaces;

public interface ITokenService
{
    string GenerateToken(Usuario usuario, Empresa empresa, PerfilUsuario perfil);
}
