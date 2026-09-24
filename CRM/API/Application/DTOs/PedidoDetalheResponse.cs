namespace OrbeB2B.Crm.Application.DTOs;

/// <summary>
/// DTO de detalhe de um pedido para o modal de Triagem
/// e impressão do espelho do orçamento.
/// </summary>
public class PedidoDetalheResponse
{
    public Guid Id { get; private set; }

    public string CodigoPedidoFormatado { get; private set; } = string.Empty;

    public string NomeCliente { get; private set; } = "Consumidor Final";

    public string NomeFantasiaCliente { get; private set; } = string.Empty;

    public string DocumentoCliente { get; private set; } = string.Empty;

    public string CepCliente { get; private set; } = string.Empty;

    public string LogradouroCliente { get; private set; } = string.Empty;

    public string NumeroCliente { get; private set; } = string.Empty;

    public string BairroCliente { get; private set; } = string.Empty;

    public string CidadeCliente { get; private set; } = string.Empty;

    public string UfCliente { get; private set; } = string.Empty;

    public string RazaoSocialEmpresa { get; private set; } = string.Empty;

    public string NomeFantasiaEmpresa { get; private set; } = string.Empty;

    public string CnpjEmpresa { get; private set; } = string.Empty;

    public string CepEmpresa { get; private set; } = string.Empty;

    public string LogradouroEmpresa { get; private set; } = string.Empty;

    public string NumeroEmpresa { get; private set; } = string.Empty;

    public string BairroEmpresa { get; private set; } = string.Empty;

    public string CidadeEmpresa { get; private set; } = string.Empty;

    public string UfEmpresa { get; private set; } = string.Empty;

    public string Origem { get; private set; } = string.Empty;

    public string ObservacaoNegociacao { get; private set; } = string.Empty;

    public decimal ValorTotalPedido { get; private set; }

    public int StatusLogisticaInt { get; private set; }

    public string StatusLogistica =>
        ((OrbeB2B.Crm.Domain.Enums.StatusFilaLogistica)StatusLogisticaInt).ToString();

    public DateTime DataCriacao { get; private set; }

    public int QuantidadeItens => Itens.Count;

    public int SomaQuantidades => Itens.Sum(item => item.Quantidade);

    public decimal TotalProdutos => Itens.Sum(item => item.Subtotal);

    // internal set permite que o repositório popule a lista após a query.
    public List<PedidoItemDetalheResponse> Itens { get; internal set; } = new();

    // Construtor sem parâmetros para Dapper.
    private PedidoDetalheResponse() { }
}

/// <summary>
/// Item de um pedido para o modal de Triagem
/// e impressão do espelho do orçamento.
/// </summary>
public class PedidoItemDetalheResponse
{
    public Guid Id { get; private set; }

    public Guid ProdutoId { get; private set; }

    public string NomeProduto { get; private set; } = string.Empty;

    public string CodigoComercial { get; private set; } = string.Empty;

    public string Embalagem { get; private set; } = string.Empty;

    public int Quantidade { get; private set; }

    public decimal PrecoUnitario { get; private set; }

    public decimal Subtotal => Quantidade * PrecoUnitario;

    public bool EhFabricacaoPropria { get; private set; }

    // Construtor sem parâmetros para Dapper.
    private PedidoItemDetalheResponse() { }
}