using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Categoria
{
    public Guid Id { get; private set; }
    public Guid EmpresaId { get; private set; }
    public string Nome { get; private set; }

    protected Categoria() { }

    public Categoria(Guid empresaId, string nome)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        Nome = nome;
    }
}
