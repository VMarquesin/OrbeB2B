using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class ProdutoConfiguration : IEntityTypeConfiguration<Produto>
{
    public void Configure(EntityTypeBuilder<Produto> builder)
    {
        builder.ToTable("produtos");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.EmpresaId).HasColumnName("empresa_id").IsRequired();
        builder.Property(e => e.CategoriaId).HasColumnName("categoria_id").IsRequired();
        
        builder.Property(e => e.CodigoComercial).HasColumnName("codigo_comercial").HasMaxLength(50).IsRequired();
        builder.Property(e => e.Descricao).HasColumnName("descricao").HasMaxLength(255).IsRequired();
        builder.Property(e => e.Embalagem).HasColumnName("embalagem").HasMaxLength(50).IsRequired();
        builder.Property(e => e.FornecedorId).HasColumnName("fornecedor_id").IsRequired();
        builder.Property(e => e.EhFabricacaoPropria).HasColumnName("eh_fabricacao_propria").IsRequired();
        
        builder.Property(e => e.PrecoAtacado).HasColumnName("preco_atacado").HasColumnType("numeric(12,2)").IsRequired();
        builder.Property(e => e.PrecoLojista).HasColumnName("preco_lojista").HasColumnType("numeric(12,2)").IsRequired();
        builder.Property(e => e.PrecoVarejo).HasColumnName("preco_varejo").HasColumnType("numeric(12,2)").IsRequired();
        builder.Property(e => e.EstaAtivo).HasColumnName("esta_ativo").IsRequired();

        builder.HasOne<Empresa>()
               .WithMany()
               .HasForeignKey(e => e.EmpresaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Categoria>()
               .WithMany()
               .HasForeignKey(e => e.CategoriaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Fornecedor>()
               .WithMany()
               .HasForeignKey(e => e.FornecedorId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
