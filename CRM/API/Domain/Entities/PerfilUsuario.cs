using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class PerfilUsuario
{
    public Guid Id { get; private set; }
    public string NomePerfil { get; private set; }
    public string Descricao { get; private set; }

    protected PerfilUsuario() { }

    public PerfilUsuario(string nomePerfil, string descricao)
    {
        Id = Guid.NewGuid();
        NomePerfil = nomePerfil;
        Descricao = descricao;
    }
}
