using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record MeuPedidoDetalheResponse(
    Guid Id,
    string CodigoPedidoFormatado,
    DateTime DataCriacao,
    decimal ValorTotalPedido,
    StatusFilaLogistica StatusLogistica,
    StatusIntegracaoErp StatusErp,
    string ObservacaoNegociacao,
    List<MeuPedidoItemResponse> Itens
);
