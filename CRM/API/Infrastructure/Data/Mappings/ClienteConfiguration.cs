using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Mappings;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clientes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");
        
        builder.Property(e => e.EmpresaId).HasColumnName("empresa_id").IsRequired();
        builder.Property(e => e.CidadeId).HasColumnName("cidade_id").IsRequired();
        
        builder.Property(e => e.Documento).HasColumnName("documento").HasMaxLength(14).IsRequired();
        builder.Property(e => e.NomeOuRazaoSocial).HasColumnName("nome_ou_razao_social").HasMaxLength(200).IsRequired();
        builder.Property(e => e.NomeFantasia).HasColumnName("nome_fantasia").HasMaxLength(200);
        builder.Property(e => e.TipoSegmento).HasColumnName("tipo_segmento").IsRequired();
        builder.Property(e => e.Cep).HasColumnName("cep").HasMaxLength(8).IsRequired();
        builder.Property(e => e.Logradouro).HasColumnName("logradouro").HasMaxLength(150).IsRequired();
        builder.Property(e => e.Numero).HasColumnName("numero").HasMaxLength(20).IsRequired();
        builder.Property(e => e.Bairro).HasColumnName("bairro").HasMaxLength(100).IsRequired();
        builder.Property(e => e.StatusCadastro).HasColumnName("status_cadastro").IsRequired();
        builder.Property(e => e.DataCadastro).HasColumnName("data_cadastro").IsRequired();

        builder.HasIndex(e => new { e.EmpresaId, e.Documento }).IsUnique();

        builder.HasOne<Empresa>()
               .WithMany()
               .HasForeignKey(e => e.EmpresaId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Cidade>()
               .WithMany()
               .HasForeignKey(e => e.CidadeId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
