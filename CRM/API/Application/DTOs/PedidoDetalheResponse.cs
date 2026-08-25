namespace OrbeB2B.Crm.Application.DTOs;

/// <summary>
/// DTO de detalhe de um pedido para o modal de Triagem (Visão Comercial e Logística).
/// </summary>
public class PedidoDetalheResponse
{
    public Guid Id { get; private set; }
    public string CodigoPedidoFormatado { get; private set; } = string.Empty;
    public string NomeCliente { get; private set; } = "Consumidor Final";
    public string Origem { get; private set; } = string.Empty;
    public string ObservacaoNegociacao { get; private set; } = string.Empty;
    public decimal ValorTotalPedido { get; private set; }
    public int StatusLogisticaInt { get; private set; }
    public string StatusLogistica => ((OrbeB2B.Crm.Domain.Enums.StatusFilaLogistica)StatusLogisticaInt).ToString();
    public DateTime DataCriacao { get; private set; }

    // internal set permite que o repositório (mesmo assembly) popule a lista após a query
    public List<PedidoItemDetalheResponse> Itens { get; internal set; } = new();

    // Construtor sem parâmetros para Dapper
    private PedidoDetalheResponse() { }
}

/// <summary>
/// Item de um pedido para o modal de Triagem.
/// </summary>
public class PedidoItemDetalheResponse
{
    public Guid Id { get; private set; }
    public Guid ProdutoId { get; private set; }
    public string NomeProduto { get; private set; } = string.Empty;
    public int Quantidade { get; private set; }
    public decimal PrecoUnitario { get; private set; }
    public decimal Subtotal => Quantidade * PrecoUnitario;
    public bool EhFabricacaoPropria { get; private set; }

    // Construtor sem parâmetros para Dapper
    private PedidoItemDetalheResponse() { }
}
