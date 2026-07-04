using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class FornecedorConfiguration : IEntityTypeConfiguration<Fornecedor>
{
    public void Configure(EntityTypeBuilder<Fornecedor> builder)
    {
        builder.ToTable("fornecedores");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.EmpresaId).HasColumnName("empresa_id").IsRequired();
        
        builder.Property(e => e.Cnpj).HasColumnName("cnpj").HasMaxLength(14).IsRequired();
        builder.Property(e => e.RazaoSocial).HasColumnName("razao_social").HasMaxLength(200).IsRequired();
        builder.Property(e => e.EstaAtivo).HasColumnName("esta_ativo").IsRequired();
        builder.Property(e => e.DataCadastro).HasColumnName("data_cadastro").IsRequired();

        builder.HasIndex(e => new { e.EmpresaId, e.Cnpj }).IsUnique();

        builder.HasOne<Empresa>()
               .WithMany()
               .HasForeignKey(e => e.EmpresaId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
