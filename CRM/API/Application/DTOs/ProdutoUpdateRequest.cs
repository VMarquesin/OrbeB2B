namespace OrbeB2B.Crm.Application.DTOs;

public record ProdutoUpdateRequest(
    string CodigoComercial,
    string Descricao,
    string Embalagem,
    Guid FornecedorId,
    bool EhFabricacaoPropria,
    decimal PrecoAtacado,
    decimal PrecoLojista,
    decimal PrecoVarejo
);
