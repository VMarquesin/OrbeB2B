using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class ProdutoImagemConfiguration : IEntityTypeConfiguration<ProdutoImagem>
{
    public void Configure(EntityTypeBuilder<ProdutoImagem> builder)
    {
        builder.ToTable("produto_imagens");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
               .HasColumnName("id");

        builder.Property(e => e.ProdutoId)
               .HasColumnName("produto_id")
               .IsRequired();

        builder.Property(e => e.ImagemUrl)
               .HasColumnName("imagem_url")
               .HasColumnType("text")
               .IsRequired();

        builder.Property(e => e.Ordem)
               .HasColumnName("ordem")
               .IsRequired();

        builder.HasIndex(e => new
        {
            e.ProdutoId,
            e.Ordem
        })
        .IsUnique();
    }
}