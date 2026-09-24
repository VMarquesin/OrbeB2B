namespace OrbeB2B.Crm.Application.DTOs;

public record ProdutoCreateRequest(
    Guid? CategoriaId,
    string CodigoComercial,
    string Descricao,
    string? DescricaoDetalhada,
    string? ImagemUrl,
    List<string>? Imagens,
    string Embalagem,
    Guid? FornecedorId,
    bool EhFabricacaoPropria,
    decimal PrecoAtacado,
    decimal PrecoLojista,
    decimal PrecoVarejo
);