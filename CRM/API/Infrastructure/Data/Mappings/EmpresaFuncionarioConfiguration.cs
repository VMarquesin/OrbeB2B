using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class EmpresaFuncionarioConfiguration : IEntityTypeConfiguration<EmpresaFuncionario>
{
    public void Configure(EntityTypeBuilder<EmpresaFuncionario> builder)
    {
        builder.ToTable("empresa_funcionarios");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.EmpresaId).HasColumnName("empresa_id").IsRequired();
        builder.Property(e => e.UsuarioId).HasColumnName("usuario_id").IsRequired();
        
        builder.Property(e => e.Cargo).HasColumnName("cargo").HasMaxLength(100).IsRequired();
        builder.Property(e => e.Departamento).HasColumnName("departamento").HasMaxLength(100);
        builder.Property(e => e.DataAdmissao).HasColumnName("data_admissao").IsRequired();

        builder.HasIndex(e => e.UsuarioId).IsUnique();

        builder.HasOne<Empresa>()
               .WithMany()
               .HasForeignKey(e => e.EmpresaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Usuario>()
               .WithMany()
               .HasForeignKey(e => e.UsuarioId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
