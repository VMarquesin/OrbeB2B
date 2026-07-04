using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class PedidoItemConfiguration : IEntityTypeConfiguration<PedidoItem>
{
    public void Configure(EntityTypeBuilder<PedidoItem> builder)
    {
        builder.ToTable("pedido_itens");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.PedidoId).HasColumnName("pedido_id").IsRequired();
        builder.Property(e => e.ProdutoId).HasColumnName("produto_id").IsRequired();
        
        builder.Property(e => e.QuantidadeSolicitada).HasColumnName("quantidade_solicitada").IsRequired();
        builder.Property(e => e.PrecoUnitarioAplicado).HasColumnName("preco_unitario_aplicado").HasColumnType("numeric(12,2)").IsRequired();
        builder.Property(e => e.EhFabricacaoPropriaSnapshot).HasColumnName("eh_fabricacao_propria_snapshot").IsRequired();

        builder.HasOne<Pedido>()
               .WithMany()
               .HasForeignKey(e => e.PedidoId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Produto>()
               .WithMany()
               .HasForeignKey(e => e.ProdutoId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
