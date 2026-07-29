namespace OrbeB2B.Crm.Application.DTOs;

public record ProdutoListResponse(
    Guid Id,
    string CodigoComercial,
    string Descricao,
    string Embalagem,
    Guid FornecedorId,
    bool EhFabricacaoPropria,
    decimal PrecoAtacado,
    decimal PrecoLojista,
    decimal PrecoVarejo,
    bool EstaAtivo,
    string NomeCategoria
);
