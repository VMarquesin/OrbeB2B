using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class PermissaoPerfilConfiguration : IEntityTypeConfiguration<PermissaoPerfil>
{
    public void Configure(EntityTypeBuilder<PermissaoPerfil> builder)
    {
        builder.ToTable("permissoes_perfil");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
               .HasColumnName("id");

        builder.Property(e => e.PerfilId)
               .HasColumnName("perfil_id")
               .IsRequired();

        builder.Property(e => e.Area)
               .HasColumnName("area")
               .HasMaxLength(50)
               .IsRequired();

        builder.HasOne<PerfilUsuario>()
               .WithMany()
               .HasForeignKey(e => e.PerfilId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.PerfilId, e.Area })
               .IsUnique();
    }
}