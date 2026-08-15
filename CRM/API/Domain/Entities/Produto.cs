using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class Produto
{
    public Guid Id { get; private set; }
    public Guid EmpresaId { get; private set; }
    public Guid CategoriaId { get; private set; }
    public string CodigoComercial { get; private set; }
    public string Descricao { get; private set; }
    public string Embalagem { get; private set; }
    public Guid FornecedorId { get; private set; }
    public bool EhFabricacaoPropria { get; private set; }
    public decimal PrecoAtacado { get; private set; }
    public decimal PrecoLojista { get; private set; }
    public decimal PrecoVarejo { get; private set; }
    public bool EstaAtivo { get; private set; }

    protected Produto() { }

    public Produto(Guid empresaId, Guid categoriaId, string codigoComercial, string descricao, string embalagem, Guid fornecedorId, bool ehFabricacaoPropria, decimal precoAtacado, decimal precoLojista, decimal precoVarejo)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        CategoriaId = categoriaId;
        CodigoComercial = codigoComercial;
        Descricao = descricao;
        Embalagem = embalagem;
        FornecedorId = fornecedorId;
        EhFabricacaoPropria = ehFabricacaoPropria;
        PrecoAtacado = precoAtacado;
        PrecoLojista = precoLojista;
        PrecoVarejo = precoVarejo;

        EstaAtivo = true;
    }

    public void Inativar()
    {
        EstaAtivo = false;
    }

    public void Reativar()
    {
        EstaAtivo = true;
    }

    public void AtualizarDados(string codigoComercial, string descricao, string embalagem,
                                Guid fornecedorId, bool ehFabricacaoPropria,
                                decimal precoAtacado, decimal precoLojista, decimal precoVarejo)
    {
        CodigoComercial = codigoComercial;
        Descricao = descricao;
        Embalagem = embalagem;
        FornecedorId = fornecedorId;
        EhFabricacaoPropria = ehFabricacaoPropria;
        PrecoAtacado = precoAtacado;
        PrecoLojista = precoLojista;
        PrecoVarejo = precoVarejo;
    }
}
