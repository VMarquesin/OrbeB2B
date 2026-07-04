using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.PerfilId).HasColumnName("perfil_id").IsRequired();
        builder.Property(e => e.ClienteId).HasColumnName("cliente_id");
        
        builder.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(150).IsRequired();
        builder.Property(e => e.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
        builder.Property(e => e.SenhaHash).HasColumnName("senha_hash").HasMaxLength(255).IsRequired();
        builder.Property(e => e.EstaAtivo).HasColumnName("esta_ativo").IsRequired();
        builder.Property(e => e.DataCriacao).HasColumnName("data_criacao").IsRequired();

        builder.HasIndex(e => e.Email).IsUnique();

        builder.HasOne<PerfilUsuario>()
               .WithMany()
               .HasForeignKey(e => e.PerfilId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Cliente>()
               .WithMany()
               .HasForeignKey(e => e.ClienteId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
