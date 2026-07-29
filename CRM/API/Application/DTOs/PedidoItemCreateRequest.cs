namespace OrbeB2B.Crm.Application.DTOs;

public record PedidoItemCreateRequest(
    Guid ProdutoId,
    int Quantidade,
    decimal PrecoUnitario,
    bool EhFabricacaoPropriaSnapshot
);
