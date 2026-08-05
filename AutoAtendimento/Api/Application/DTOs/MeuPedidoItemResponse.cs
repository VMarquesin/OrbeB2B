namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record MeuPedidoItemResponse(
    Guid ProdutoId,
    string CodigoComercial,
    string Descricao,
    int QuantidadeSolicitada,
    decimal PrecoUnitarioAplicado,
    decimal Subtotal
);
