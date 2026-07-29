using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class PedidoConfiguration : IEntityTypeConfiguration<Pedido>
{
    public void Configure(EntityTypeBuilder<Pedido> builder)
    {
        builder.ToTable("pedidos");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.EmpresaId).HasColumnName("empresa_id").IsRequired();
        builder.Property(e => e.ClienteId).HasColumnName("cliente_id").IsRequired();
        
        builder.Property(e => e.CodigoPedidoFormatado).HasColumnName("codigo_pedido_formatado").HasMaxLength(50).IsRequired();
        builder.Property(e => e.Origem).HasColumnName("origem").IsRequired();
        builder.Property(e => e.StatusLogistica).HasColumnName("status_logistica").IsRequired();
        builder.Property(e => e.StatusErp).HasColumnName("status_erp").IsRequired();
        builder.Property(e => e.ValorTotalPedido).HasColumnName("valor_total_pedido").HasColumnType("numeric(12,2)").IsRequired();
        builder.Property(e => e.ObservacaoNegociacao).HasColumnName("observacao_negociacao").HasColumnType("text");
        builder.Property(e => e.DataCriacao).HasColumnName("data_criacao").IsRequired();

        builder.HasIndex(e => e.CodigoPedidoFormatado).IsUnique();

        builder.HasOne<Empresa>()
               .WithMany()
               .HasForeignKey(e => e.EmpresaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Cliente>()
               .WithMany()
               .HasForeignKey(e => e.ClienteId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Itens)
               .WithOne()
               .HasForeignKey(e => e.PedidoId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(e => e.Itens)
               .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
