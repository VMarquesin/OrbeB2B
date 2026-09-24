namespace OrbeB2B.Crm.Application.DTOs;

public class ProdutoListResponse
{
    public Guid Id { get; set; }

    public string CodigoComercial { get; set; }

    public string Descricao { get; set; }

    public string? DescricaoDetalhada { get; set; }

    public string? ImagemUrl { get; set; }

    public string Embalagem { get; set; }

    public Guid? FornecedorId { get; set; }

    public bool EhFabricacaoPropria { get; set; }

    public decimal PrecoAtacado { get; set; }

    public decimal PrecoLojista { get; set; }

    public decimal PrecoVarejo { get; set; }

    public bool EstaAtivo { get; set; }

    public string NomeCategoria { get; set; }

    public string[]? Imagens { get; set; }
}