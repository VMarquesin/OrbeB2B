using OrbeB2B.Crm.Application.Models;

namespace OrbeB2B.Crm.Application.Services.Interfaces;

public interface ITokenService
{
    string GerarToken(UsuarioAuthModel usuario);
}
