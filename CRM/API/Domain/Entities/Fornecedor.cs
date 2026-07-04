using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Fornecedor
{
    public Guid Id { get; private set; }
    public Guid EmpresaId { get; private set; }
    public string Cnpj { get; private set; }
    public string RazaoSocial { get; private set; }
    public bool EstaAtivo { get; private set; }
    public DateTime DataCadastro { get; private set; }

    protected Fornecedor() { }

    public Fornecedor(Guid empresaId, string cnpj, string razaoSocial)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        Cnpj = cnpj;
        RazaoSocial = razaoSocial;
        
        EstaAtivo = true;
        DataCadastro = DateTime.UtcNow;
    }

    public void Inativar()
    {
        EstaAtivo = false;
    }
}
