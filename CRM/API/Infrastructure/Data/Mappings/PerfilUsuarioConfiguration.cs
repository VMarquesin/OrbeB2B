using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class PerfilUsuarioConfiguration : IEntityTypeConfiguration<PerfilUsuario>
{
    public void Configure(EntityTypeBuilder<PerfilUsuario> builder)
    {
        builder.ToTable("perfis_usuario");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.NomePerfil).HasColumnName("nome_perfil").HasMaxLength(50).IsRequired();
        builder.Property(e => e.Descricao).HasColumnName("descricao").HasColumnType("text");

        builder.HasIndex(e => e.NomePerfil).IsUnique();
    }
}
