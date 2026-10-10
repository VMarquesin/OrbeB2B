
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class ArquivoImagemProdutoConfiguration
    : IEntityTypeConfiguration<ArquivoImagemProduto>
{
    public void Configure(
        EntityTypeBuilder<ArquivoImagemProduto> builder)
    {
        builder.ToTable("arquivos_imagens_produtos");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnName("id");

        builder.Property(e => e.Conteudo)
            .HasColumnName("conteudo")
            .HasColumnType("bytea")
            .IsRequired();

        builder.Property(e => e.TipoConteudo)
            .HasColumnName("tipo_conteudo")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.NomeArquivo)
            .HasColumnName("nome_arquivo")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(e => e.CriadoEm)
            .HasColumnName("criado_em")
            .IsRequired();
    }
}
