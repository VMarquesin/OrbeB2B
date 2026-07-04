using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class CidadeConfiguration : IEntityTypeConfiguration<Cidade>
{
    public void Configure(EntityTypeBuilder<Cidade> builder)
    {
        builder.ToTable("cidades");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.EstadoId).HasColumnName("estado_id").IsRequired();
        builder.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();

        builder.HasOne<Estado>()
               .WithMany()
               .HasForeignKey(e => e.EstadoId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
