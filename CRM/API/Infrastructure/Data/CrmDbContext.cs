using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Domain.Entities;
using System.Reflection;

namespace OrbeB2B.Crm.Infrastructure.Data;

public class CrmDbContext : DbContext
{
    public CrmDbContext(DbContextOptions<CrmDbContext> options) : base(options) { }
    
    public DbSet<Estado> Estados { get; set; }
    public DbSet<Cidade> Cidades { get; set; }
    public DbSet<Empresa> Empresas { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Fornecedor> Fornecedores { get; set; }
    public DbSet<PerfilUsuario> PerfisUsuario { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<EmpresaFuncionario> EmpresaFuncionarios { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<PedidoItem> PedidoItens { get; set; }
    public DbSet<SolicitacaoAlteracaoEndereco> SolicitacoesAlteracaoEndereco { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}