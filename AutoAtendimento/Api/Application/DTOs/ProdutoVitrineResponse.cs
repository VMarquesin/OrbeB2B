namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record ProdutoVitrineResponse(
    Guid Id,
    string CodigoComercial,
    string Descricao,
    string Embalagem,
    decimal Preco,
    string? DescricaoDetalhada   // nullable — campo opcional no cadastro do produto
);
