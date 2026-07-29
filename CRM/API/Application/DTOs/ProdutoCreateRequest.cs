namespace OrbeB2B.Crm.Application.DTOs;

public record ProdutoCreateRequest(
    Guid CategoriaId,
    string CodigoComercial,
    string Descricao,
    string Embalagem,
    Guid FornecedorId,
    bool EhFabricacaoPropria,
    decimal PrecoAtacado,
    decimal PrecoLojista,
    decimal PrecoVarejo
);
