using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class PermissaoPerfil
{
    public Guid Id { get; private set; }
    public Guid PerfilId { get; private set; }
    public string Area { get; private set; }

    protected PermissaoPerfil() { }

    public PermissaoPerfil(Guid perfilId, string area)
    {
        Id = Guid.NewGuid();
        PerfilId = perfilId;
        Area = area;
    }
}