using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class PermissaoUsuario
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Area { get; private set; }

    protected PermissaoUsuario() { }

    public PermissaoUsuario(Guid usuarioId, string area)
    {
        Id = Guid.NewGuid();
        UsuarioId = usuarioId;
        Area = area;
    }
}