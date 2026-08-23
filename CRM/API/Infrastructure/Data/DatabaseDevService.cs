using Bogus;
using Bogus.Extensions.Brazil;
using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Domain.Entities;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Infrastructure.Data;

public class DatabaseDevService
{
    private readonly CrmDbContext _context;

    public DatabaseDevService(CrmDbContext context)
    {
        _context = context;
    }

    // =========================================================================
    // SEED — Popula o banco com dados realistas via Bogus
    // =========================================================================
    public async Task PopularBancoAsync()
    {
        // Trava de segurança: só roda se o banco estiver zerado
        if (await _context.Empresas.AnyAsync()) return;

        Randomizer.Seed = new Random(9876); // Seed fixo = dados reproduzíveis

        // --- Estado e Cidade base (necessários para FK) ---
        var estado = new Estado("SP", "São Paulo");
        var cidade = new Cidade(estado.Id, "São Paulo");

        await _context.Estados.AddAsync(estado);
        await _context.Cidades.AddAsync(cidade);
        await _context.SaveChangesAsync();

        // --- Empresa Matriz ---
        var empresa = new Empresa(
            cidade.Id,
            "12345678000195",
            "OrbeB2B Distribuidora Ltda",
            "OrbeB2B",
            "01310100",
            "Av. Paulista",
            "1000",
            "Bela Vista"
        );
        await _context.Empresas.AddAsync(empresa);
        await _context.SaveChangesAsync();

        // --- Perfis de usuário ---
        var perfilAdmin = new PerfilUsuario("AdminMaster", "Administrador com acesso total");
        var perfilVendedor = new PerfilUsuario("Vendedor", "Acesso ao CRM e dashboards");
        var perfilComprador = new PerfilUsuario("CompradorB2B", "Acesso ao portal de autoatendimento");

        await _context.PerfisUsuario.AddRangeAsync(perfilAdmin, perfilVendedor, perfilComprador);
        await _context.SaveChangesAsync();

        // --- Usuário Admin (login fixo para desenvolvimento) ---
        var senhaAdmin = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        var usuarioAdmin = new Usuario(perfilAdmin.Id, "Administrador OrbeB2B", "admin@orbeb2b.com.br", senhaAdmin);
        var vinculoAdmin = new EmpresaFuncionario(empresa.Id, usuarioAdmin.Id, "Administrador", "TI");

        // --- Usuário Vendedor ---
        var senhaVendedor = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        var usuarioVendedor = new Usuario(perfilVendedor.Id, "João Vendedor Silva", "vendedor@orbeb2b.com.br", senhaVendedor);
        var vinculoVendedor = new EmpresaFuncionario(empresa.Id, usuarioVendedor.Id, "Vendedor Sênior", "Comercial");

        await _context.Usuarios.AddRangeAsync(usuarioAdmin, usuarioVendedor);
        await _context.SaveChangesAsync();
        await _context.EmpresaFuncionarios.AddRangeAsync(vinculoAdmin, vinculoVendedor);
        await _context.SaveChangesAsync();

        // --- Categorias ---
        var categoriaFaker = new Faker<Categoria>("pt_BR")
            .CustomInstantiator(f => new Categoria(empresa.Id, f.Commerce.Categories(1).First()));

        var categorias = categoriaFaker.Generate(8);
        await _context.Categorias.AddRangeAsync(categorias);
        await _context.SaveChangesAsync();

        // --- Fornecedores (para produtos de terceiros) ---
        var fornecedorFaker = new Faker<Fornecedor>("pt_BR")
            .CustomInstantiator(f => new Fornecedor(empresa.Id, f.Company.Cnpj(false), f.Company.CompanyName()));

        var fornecedores = fornecedorFaker.Generate(10);
        await _context.Fornecedores.AddRangeAsync(fornecedores);
        await _context.SaveChangesAsync();

        // --- 50 Produtos (70% próprios, 30% terceiros) ---
        var fakerProduto = new Faker("pt_BR");
        var produtos = new List<Produto>();

        for (var i = 1; i <= 50; i++)
        {
            var ehProprio = i <= 35; // 35 próprios (70%), 15 terceiros (30%)
            var fornecedorId = fornecedores[fakerProduto.Random.Int(0, fornecedores.Count - 1)].Id;
            var categoriaId = categorias[fakerProduto.Random.Int(0, categorias.Count - 1)].Id;

            var produto = new Produto(
                empresa.Id,
                categoriaId,
                $"SKU-{i:000}",
                fakerProduto.Commerce.ProductName(),
                fakerProduto.PickRandom("Caixa 12un", "Fardo 24un", "Pacote 6un", "Display 10un", "Unidade"),
                fornecedorId,
                ehProprio,
                precoAtacado:  Math.Round(fakerProduto.Random.Decimal(10m, 150m), 2),
                precoLojista:  Math.Round(fakerProduto.Random.Decimal(12m, 180m), 2),
                precoVarejo:   Math.Round(fakerProduto.Random.Decimal(15m, 200m), 2)
            );
            produtos.Add(produto);
        }

        await _context.Produtos.AddRangeAsync(produtos);
        await _context.SaveChangesAsync();

        // --- 30 Clientes ---
        var clienteFaker = new Faker<Cliente>("pt_BR")
            .CustomInstantiator(f =>
            {
                var nome = f.Company.CompanyName();
                return new Cliente(
                    empresa.Id,
                    cidade.Id,
                    f.Company.Cnpj(false),           // 14 dígitos sem pontuação
                    nome + " Ltda",
                    nome,
                    TipoSegmentoCliente.B2B,
                    f.Address.ZipCode("########"),
                    f.Address.StreetName(),
                    f.Random.Int(1, 2000).ToString(),
                    f.Address.City()
                );
            });

        var clientes = clienteFaker.Generate(30);

        // Aprovar 25 clientes (carteira ativa) e deixar 5 pendentes
        foreach (var c in clientes.Take(25))
            c.AtualizarStatusCadastro(StatusCadastroCliente.Aprovado);

        await _context.Clientes.AddRangeAsync(clientes);
        await _context.SaveChangesAsync();

        // =====================================================================
        // --- Usuário Comprador (vinculado ao primeiro cliente aprovado) ---
        // =====================================================================
        var primeiroCliente = clientes.First(c => c.StatusCadastro == StatusCadastroCliente.Aprovado);

        var senhaComprador = BCrypt.Net.BCrypt.HashPassword("   !");

        var usuarioComprador = new Usuario(
            perfilComprador.Id,
            $"Contato - {primeiroCliente.NomeFantasia}",
            "comprador@orbeb2b.com.br",
            senhaComprador,
            clienteId: primeiroCliente.Id   // vínculo direto via construtor (parâmetro opcional)
        );

        await _context.Usuarios.AddAsync(usuarioComprador);
        await _context.SaveChangesAsync();
        // =====================================================================


        // --- 300 Pedidos nos últimos 6 meses com 2 a 8 itens ---
        var fakerPedido = new Faker("pt_BR");
        var statusLogisticaValores = Enum.GetValues<StatusFilaLogistica>();
        var statusErpValores = Enum.GetValues<StatusIntegracaoErp>();
        var pedidos = new List<Pedido>();
        var numero = 1;

        for (var i = 0; i < 300; i++)
        {
            var clientePedido = clientes[fakerPedido.Random.Int(0, clientes.Count - 1)];
            var pedido = new Pedido(
                empresa.Id,
                clientePedido.Id,
                $"PED-{numero++:0000}",
                fakerPedido.Lorem.Sentence(4)
            );

            // Data aleatória nos últimos 6 meses
            var dataCriacao = fakerPedido.Date.Past(0, DateTime.UtcNow).AddMonths(-6 + fakerPedido.Random.Int(0, 5));
            // Ajusta DataCriacao via EF shadow (o construtor usa UtcNow, mas vamos sobrescrever após Add)

            var qtdItens = fakerPedido.Random.Int(2, 8);
            var produtosSorteados = fakerPedido.Random.ListItems(produtos, qtdItens);

            foreach (var prod in produtosSorteados)
            {
                pedido.AdicionarItem(
                    prod.Id,
                    fakerPedido.Random.Int(1, 20),
                    prod.PrecoAtacado,
                    prod.EhFabricacaoPropria
                );
            }

            // Evolui o status logístico/ERP aleatoriamente para ter dados variados no BI
            pedido.AtualizarStatusLogistica(fakerPedido.PickRandom(statusLogisticaValores));
            pedido.AtualizarStatusErp(fakerPedido.PickRandom(statusErpValores));

            pedidos.Add(pedido);
        }

        await _context.Pedidos.AddRangeAsync(pedidos);
        await _context.SaveChangesAsync();

        // Distribui as datas de criação retroativamente (via SQL direto — DataCriacao tem private set)
        await _context.Database.ExecuteSqlRawAsync(@"
            UPDATE pedidos
            SET data_criacao = NOW() - (random() * INTERVAL '180 days')
            WHERE empresa_id = {0}", empresa.Id);

        Console.WriteLine($"[SEED] Banco populado: 1 empresa | {produtos.Count} produtos | {clientes.Count} clientes | {pedidos.Count} pedidos");
    }

    // =========================================================================
    // RESET — Limpa todas as tabelas de dados (preserva estrutura)
    // =========================================================================
    public async Task ResetarBancoAsync()
    {
        // Ordem respeita as FKs (filho antes do pai)
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE pedido_itens CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE pedidos CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE solicitacoes_alteracao_endereco CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE clientes CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE produtos CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE fornecedores CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE categorias CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE empresa_funcionarios CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE usuarios CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE perfis_usuario CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE empresas CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE cidades CASCADE");
        await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE estados CASCADE");

        Console.WriteLine("[RESET] ✅ Banco resetado com sucesso.");
    }
}
