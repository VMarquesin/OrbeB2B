namespace OrbeB2B.Crm.Application.DTOs;

/// <summary>
/// DTO de leitura para listagem de pedidos.
/// Usa classe com setter privado + construtor sem parâmetros para compatibilidade com Dapper.
/// O Dapper mapeia colunas snake_case → propriedades PascalCase via DefaultTypeMap.MatchNamesWithUnderscores.
/// </summary>
public class PedidoResumoListResponse
{
    public Guid Id { get; private set; }
    public string CodigoPedidoFormatado { get; private set; } = string.Empty;
    public string NomeCliente { get; private set; } = "Consumidor Final";
    public decimal ValorTotalPedido { get; private set; }

    // Armazena o valor inteiro do enum vindo do banco e expõe como string para o Front-end
    public int StatusLogisticaInt { get; private set; }
    public string StatusLogistica => ((OrbeB2B.Crm.Domain.Enums.StatusFilaLogistica)StatusLogisticaInt).ToString();

    public string Origem { get; private set; } = string.Empty;
    public DateTime DataCriacao { get; private set; }

    // Construtor sem parâmetros obrigatório para o Dapper
    private PedidoResumoListResponse() { }
}
