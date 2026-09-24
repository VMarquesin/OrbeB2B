using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class ProdutoImagem
{
    public Guid Id { get; private set; }
    public Guid ProdutoId { get; private set; }
    public string ImagemUrl { get; private set; }
    public int Ordem { get; private set; }

    public Produto Produto { get; private set; }

    protected ProdutoImagem() { }

    public ProdutoImagem(
        Guid produtoId,
        string imagemUrl,
        int ordem)
    {
        Id = Guid.NewGuid();
        ProdutoId = produtoId;
        ImagemUrl = imagemUrl;
        Ordem = ordem;
    }
}