using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Configurations;

public class PermissaoUsuarioConfiguration : IEntityTypeConfiguration<PermissaoUsuario>
{
    public void Configure(EntityTypeBuilder<PermissaoUsuario> builder)
    {
        builder.ToTable("permissoes_usuario");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasColumnName("id");

        builder.Property(p => p.UsuarioId)
            .HasColumnName("usuario_id")
            .IsRequired();

        builder.Property(p => p.Area)
            .HasColumnName("area")
            .IsRequired();

        builder.HasIndex(p => new { p.UsuarioId, p.Area })
            .IsUnique();

        builder.HasOne<Usuario>()
            .WithMany()
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}