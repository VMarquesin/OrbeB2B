using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class EmpresaConfiguration : IEntityTypeConfiguration<Empresa>
{
    public void Configure(EntityTypeBuilder<Empresa> builder)
    {

        builder.ToTable("empresas");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id).HasColumnName("id");

        builder.Property(e => e.CidadeId).HasColumnName("cidade_id").IsRequired();

        builder.Property(e => e.Cnpj)
               .HasColumnName("cnpj")
               .HasMaxLength(14)
               .IsRequired();

        builder.Property(e => e.RazaoSocial)
               .HasColumnName("razao_social")
               .HasMaxLength(200)
               .IsRequired();

        builder.Property(e => e.NomeFantasia)
               .HasColumnName("nome_fantasia")
               .HasMaxLength(200);
               
        builder.Property(e => e.Cep).HasColumnName("cep").HasMaxLength(8).IsRequired();
        builder.Property(e => e.Logradouro).HasColumnName("logradouro").HasMaxLength(150).IsRequired();
        builder.Property(e => e.Numero).HasColumnName("numero").HasMaxLength(20).IsRequired();
        builder.Property(e => e.Bairro).HasColumnName("bairro").HasMaxLength(100).IsRequired();
        
        builder.Property(e => e.EstaAtiva).HasColumnName("esta_ativa").IsRequired();
        builder.Property(e => e.DataCadastro).HasColumnName("data_cadastro").IsRequired();

        builder.HasIndex(e => e.Cnpj).IsUnique();
        
        builder.HasOne<Cidade>()
               .WithMany()
               .HasForeignKey(e => e.CidadeId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}