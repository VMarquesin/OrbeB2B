using System;
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

    protected Pedido() { }

    public Pedido(Guid empresaId, Guid clienteId, string codigoPedidoFormatado, OrigemPedido origem, decimal valorTotalPedido, string observacaoNegociacao)
    {
        Id = Guid.NewGuid();
        EmpresaId = empresaId;
        ClienteId = clienteId;
        CodigoPedidoFormatado = codigoPedidoFormatado;
        Origem = origem;
        ValorTotalPedido = valorTotalPedido;
        ObservacaoNegociacao = observacaoNegociacao;
        
        StatusLogistica = StatusFilaLogistica.AguardandoValidacao;
        StatusErp = StatusIntegracaoErp.Pendente;
        DataCriacao = DateTime.UtcNow;
    }
}
