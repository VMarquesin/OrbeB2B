using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Estado
{
    public Guid Id { get; private set; }
    public string Sigla { get; private set; }
    public string Nome { get; private set; }

    protected Estado() { }

    public Estado(string sigla, string nome)
    {
        Id = Guid.NewGuid();
        Sigla = sigla;
        Nome = nome;
    }
}
