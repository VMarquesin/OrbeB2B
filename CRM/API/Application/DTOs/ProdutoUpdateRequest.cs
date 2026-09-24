namespace OrbeB2B.Crm.Application.DTOs;

public record ProdutoUpdateRequest(
    string CodigoComercial,
    string Descricao,
    string? DescricaoDetalhada,
    string? ImagemUrl,
    List<string>? Imagens,
    string Embalagem,
    Guid? CategoriaId,
    Guid? FornecedorId,
    bool EhFabricacaoPropria,
    decimal PrecoAtacado,
    decimal PrecoLojista,
    decimal PrecoVarejo
);