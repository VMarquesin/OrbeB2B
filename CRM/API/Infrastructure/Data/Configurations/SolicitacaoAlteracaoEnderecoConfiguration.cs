using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrbeB2B.Crm.Domain.Entities;

namespace OrbeB2B.Crm.Infrastructure.Data.Configurations;

public class SolicitacaoAlteracaoEnderecoConfiguration : IEntityTypeConfiguration<SolicitacaoAlteracaoEndereco>
{
    public void Configure(EntityTypeBuilder<SolicitacaoAlteracaoEndereco> builder)
    {
        builder.ToTable("solicitacoes_alteracao_endereco");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");

        builder.Property(s => s.ClienteId).HasColumnName("cliente_id").IsRequired();
        builder.Property(s => s.Cep).HasColumnName("cep").HasMaxLength(8).IsRequired();
        builder.Property(s => s.Uf).HasColumnName("uf").HasMaxLength(2).IsRequired();
        builder.Property(s => s.Cidade).HasColumnName("cidade").HasMaxLength(150).IsRequired();
        builder.Property(s => s.Bairro).HasColumnName("bairro").HasMaxLength(100).IsRequired();
        builder.Property(s => s.Logradouro).HasColumnName("logradouro").HasMaxLength(150).IsRequired();
        builder.Property(s => s.Numero).HasColumnName("numero").HasMaxLength(20).IsRequired();
        builder.Property(s => s.Complemento).HasColumnName("complemento").HasMaxLength(80);
        builder.Property(s => s.Motivo).HasColumnName("motivo").HasMaxLength(500).IsRequired();
        builder.Property(s => s.Status).HasColumnName("status").IsRequired();
        builder.Property(s => s.DataSolicitacao).HasColumnName("data_solicitacao").IsRequired();
        builder.Property(s => s.DataAnalise).HasColumnName("data_analise");

        builder.HasOne<Cliente>()
               .WithMany()
               .HasForeignKey(s => s.ClienteId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => s.ClienteId);
        builder.HasIndex(s => s.Status);
    }
}
