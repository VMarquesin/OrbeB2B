
namespace OrbeB2B.Crm.Domain.Entities;

public class ArquivoImagemProduto
{
    public Guid Id { get; private set; }

    public byte[] Conteudo { get; private set; } = Array.Empty<byte>();

    public string TipoConteudo { get; private set; } = string.Empty;

    public string NomeArquivo { get; private set; } = string.Empty;

    public DateTime CriadoEm { get; private set; }

    protected ArquivoImagemProduto() { }

    public ArquivoImagemProduto(
        Guid id,
        byte[] conteudo,
        string tipoConteudo,
        string nomeArquivo)
    {
        if (conteudo is null || conteudo.Length == 0)
            throw new ArgumentException(
                "O conteúdo da imagem não pode ser vazio.",
                nameof(conteudo));

        Id = id;
        Conteudo = conteudo;
        TipoConteudo = tipoConteudo;
        NomeArquivo = nomeArquivo;
        CriadoEm = DateTime.UtcNow;
    }
}
