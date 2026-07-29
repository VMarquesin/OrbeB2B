namespace OrbeB2B.Crm.Application.DTOs;

public record PedidoResumoListResponse(
    Guid Id,
    string CodigoPedidoFormatado,
    string NomeCliente,
    decimal ValorTotalPedido,
    string StatusLogistica,
    DateTime DataCriacao
);
