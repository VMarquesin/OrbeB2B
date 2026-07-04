using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Cidade
{
    public Guid Id { get; private set; }
    public Guid EstadoId { get; private set; }
    public string Nome { get; private set; }

    protected Cidade() { }

    public Cidade(Guid estadoId, string nome)
    {
        Id = Guid.NewGuid();
        EstadoId = estadoId;
        Nome = nome;
    }
}
