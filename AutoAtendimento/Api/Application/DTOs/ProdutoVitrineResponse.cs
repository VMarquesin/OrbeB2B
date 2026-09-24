namespace OrbeB2B.AutoAtendimento.Application.DTOs;
public class ProdutoVitrineResponse
{
    public Guid Id { get; set; }

    public string CodigoComercial { get; set; }

    public string Descricao { get; set; }

    public string Embalagem { get; set; }

    public decimal Preco { get; set; }

    public string? ImagemUrl { get; set; }

    public string? DescricaoDetalhada { get; set; }

    public string[]? Imagens { get; set; }
}
