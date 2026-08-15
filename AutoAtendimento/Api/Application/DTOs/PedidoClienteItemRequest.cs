namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record PedidoClienteItemRequest(
    Guid ProdutoId,
    int Quantidade,
    decimal PrecoUnitario
);
