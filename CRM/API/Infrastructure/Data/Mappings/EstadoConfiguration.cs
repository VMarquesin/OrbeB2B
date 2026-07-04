using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class EstadoConfiguration : IEntityTypeConfiguration<Estado>
{
    public void Configure(EntityTypeBuilder<Estado> builder)
    {
        builder.ToTable("estados");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");

        builder.Property(e => e.Sigla).HasColumnName("sigla").HasMaxLength(2).IsRequired();
        builder.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();

        builder.HasIndex(e => e.Sigla).IsUnique();
    }
}
