using System;
using System.Collections.Generic;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Domain.Entities;

public class Pedido
{
    public Guid Id { get; private set; }
    public Guid EmpresaId { get; private set; }
    public Guid ClienteId { get; private set; }
    public string CodigoPedidoFormatado { get; private set; }
    public OrigemPedido Origem { get; private set; }
    public StatusFilaLogistica StatusLogistica { get; private set; }
    public StatusIntegracaoErp StatusErp { get; private set; }
    public decimal ValorTotalPedido { get; private set; }
    public string ObservacaoNegociacao { get; private set; }
    public DateTime DataCriacao { get; private set; }

    private readonly List<PedidoItem> _itens = new();
    public IReadOnlyCollection<PedidoItem> Itens => _itens.AsReadOnly();

    protected Pedido() { }

    public Pedido(Guid empresaId, Guid clienteId, string codigoPedidoFormatado, string observacaoNegociacao)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        ClienteId = clienteId;
        CodigoPedidoFormatado = codigoPedidoFormatado;
        ObservacaoNegociacao = observacaoNegociacao;

        Origem = OrigemPedido.APP;
        StatusLogistica = StatusFilaLogistica.AguardandoValidacao;
        StatusErp = StatusIntegracaoErp.Pendente;
        ValorTotalPedido = 0;
        DataCriacao = DateTime.UtcNow;
    }

    public void AdicionarItem(Guid produtoId, int quantidadeSolicitada, decimal precoUnitarioAplicado, bool ehFabricacaoPropriaSnapshot)
    {
        var item = new PedidoItem(Id, produtoId, quantidadeSolicitada, precoUnitarioAplicado, ehFabricacaoPropriaSnapshot);
        _itens.Add(item);

        CalcularValorTotal();
    }

    public void CalcularValorTotal()
    {
        ValorTotalPedido = 0;
        foreach (var item in _itens)
        {
            ValorTotalPedido += item.QuantidadeSolicitada * item.PrecoUnitarioAplicado;
        }
    }
}
