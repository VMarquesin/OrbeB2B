using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IPerfilWriteRepository
{
    Task<bool> NomePerfilJaCadastradoAsync(string nomePerfil);
    Task CadastrarPerfilAsync(PerfilUsuario perfil, IEnumerable<PermissaoPerfil> permissoes);
}