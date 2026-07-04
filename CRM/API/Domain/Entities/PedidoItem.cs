using System;

namespace OrbeB2B.Crm.Domain.Entities;

public class PedidoItem
{
    public Guid Id { get; private set; }
    public Guid PedidoId { get; private set; }
    public Guid ProdutoId { get; private set; }
    public int QuantidadeSolicitada { get; private set; }
    public decimal PrecoUnitarioAplicado { get; private set; }
    public bool EhFabricacaoPropriaSnapshot { get; private set; }

    protected PedidoItem() { }

    public PedidoItem(Guid pedidoId, Guid produtoId, int quantidadeSolicitada, decimal precoUnitarioAplicado, bool ehFabricacaoPropriaSnapshot)
    {
        Id = Guid.NewGuid();
        PedidoId = pedidoId;
        ProdutoId = produtoId;
        QuantidadeSolicitada = quantidadeSolicitada;
        PrecoUnitarioAplicado = precoUnitarioAplicado;
        EhFabricacaoPropriaSnapshot = ehFabricacaoPropriaSnapshot;
    }
}
