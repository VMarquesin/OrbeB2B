using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class InteligenciaReadRepository : IInteligenciaReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    // Valores dos enums usados diretamente nas queries
    private static readonly int StatusAguardandoValidacao = (int)StatusFilaLogistica.AguardandoValidacao;
    private static readonly int StatusClienteAprovado = (int)StatusCadastroCliente.Aprovado;

    public InteligenciaReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // =========================================================================
    // MÉTODO 1 — Dashboard Principal (QueryMultiple = 4 queries em 1 roundtrip)
    // =========================================================================
    public async Task<DashboardPrincipalResponse> ObterDashboardPrincipalAsync(Guid tenantId)
    {
        const string sql = @"
            -- Q1: Cards (receita validada, validação pendente, carteira ativa)
            SELECT
                COALESCE(SUM(p.valor_total_pedido) FILTER (WHERE p.status_logistica <> @AguardandoValidacao), 0) AS ReceitaValidada,
                COUNT(p.id) FILTER (WHERE p.status_logistica = @AguardandoValidacao)                            AS ValidacaoPendenteQtd,
                (SELECT COUNT(c.id) FROM clientes c
                 WHERE c.empresa_id = @TenantId AND c.status_cadastro = @StatusAprovado)                        AS CarteiraAtivaQtd
            FROM pedidos p
            WHERE p.empresa_id = @TenantId;

            -- Q2: Gráfico receita própria vs terceiros
            SELECT
                COALESCE(SUM(pi2.quantidade_solicitada * pi2.preco_unitario_aplicado) FILTER (WHERE pi2.eh_fabricacao_propria_snapshot = TRUE),  0) AS ReceitaPropria,
                COALESCE(SUM(pi2.quantidade_solicitada * pi2.preco_unitario_aplicado) FILTER (WHERE pi2.eh_fabricacao_propria_snapshot = FALSE), 0) AS ReceitaTerceiros
            FROM pedido_itens pi2
            INNER JOIN pedidos ped ON pi2.pedido_id = ped.id
            WHERE ped.empresa_id = @TenantId;

            -- Q3: Top 10 mais vendidos - Próprios
            SELECT
                p3.descricao AS ProdutoDescricao,
                CAST(SUM(pi3.quantidade_solicitada) AS int) AS QtdVendida
            FROM pedido_itens pi3
            INNER JOIN pedidos ped3 ON pi3.pedido_id = ped3.id
            INNER JOIN produtos p3  ON pi3.produto_id = p3.id
            WHERE ped3.empresa_id = @TenantId
              AND pi3.eh_fabricacao_propria_snapshot = TRUE
            GROUP BY p3.descricao
            ORDER BY QtdVendida DESC
            LIMIT 10;

            -- Q4: Top 10 mais vendidos - Terceiros
            SELECT
                p4.descricao AS ProdutoDescricao,
                CAST(SUM(pi4.quantidade_solicitada) AS int) AS QtdVendida
            FROM pedido_itens pi4
            INNER JOIN pedidos ped4 ON pi4.pedido_id = ped4.id
            INNER JOIN produtos p4  ON pi4.produto_id = p4.id
            WHERE ped4.empresa_id = @TenantId
              AND pi4.eh_fabricacao_propria_snapshot = FALSE
            GROUP BY p4.descricao
            ORDER BY QtdVendida DESC
            LIMIT 10;";

        using var connection = _connectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(sql, new
        {
            TenantId = tenantId,
            AguardandoValidacao = StatusAguardandoValidacao,
            StatusAprovado = StatusClienteAprovado
        });

        var cards = await multi.ReadFirstAsync<DashboardCardsResponse>();
        var grafico = await multi.ReadFirstAsync<DashboardGraficoReceitaResponse>();
        var topProprios = await multi.ReadAsync<TopProdutoItem>();
        var topTerceiros = await multi.ReadAsync<TopProdutoItem>();

        return new DashboardPrincipalResponse(cards, grafico, topProprios, topTerceiros);
    }

    // =========================================================================
    // MÉTODO 2 — Histórico de Faturamento (com filtro de datas opcional)
    // =========================================================================
    public async Task<HistoricoFaturamentoResponse> ObterHistoricoFaturamentoAsync(
        Guid tenantId, DateTime? dataInicio, DateTime? dataFim)
    {
        const string sql = @"
            SELECT
                p.data_criacao   AS Data,
                p.codigo_pedido_formatado AS Codigo,
                c.nome_fantasia  AS ClienteNome,
                p.valor_total_pedido AS ValorFechado,
                p.status_erp     AS StatusErp
            FROM pedidos p
            INNER JOIN clientes c ON p.cliente_id = c.id
            WHERE p.empresa_id = @TenantId
              AND (@DataInicio IS NULL OR p.data_criacao >= @DataInicio)
              AND (@DataFim    IS NULL OR p.data_criacao <= @DataFim)
            ORDER BY p.data_criacao DESC";

        using var connection = _connectionFactory.CreateConnection();

        var pedidos = (await connection.QueryAsync<PedidoHistoricoItem>(sql, new
        {
            TenantId = tenantId,
            DataInicio = dataInicio,
            DataFim = dataFim.HasValue ? dataFim.Value.Date.AddDays(1).AddTicks(-1) : (DateTime?)null
        })).ToList();

        var receita = pedidos.Sum(p => p.ValorFechado);
        var volume = pedidos.Count;
        var ticketMedio = volume > 0 ? receita / volume : 0m;

        return new HistoricoFaturamentoResponse(receita, volume, ticketMedio, pedidos);
    }

    // =========================================================================
    // MÉTODO 3 — Curva ABC (Pareto)
    // =========================================================================
    public async Task<BiCurvaAbcResponse> ObterCurvaAbcProdutosAsync(Guid tenantId)
    {
        const string sql = @"
            SELECT
                pro.descricao                                                                    AS Produto,
                CAST(SUM(pi5.quantidade_solicitada) AS int)                                      AS QtdVendida,
                SUM(pi5.quantidade_solicitada * pi5.preco_unitario_aplicado)                     AS FaturamentoTotal
            FROM pedido_itens pi5
            INNER JOIN pedidos ped5 ON pi5.pedido_id = ped5.id
            INNER JOIN produtos pro  ON pi5.produto_id = pro.id
            WHERE ped5.empresa_id = @TenantId
            GROUP BY pro.descricao
            ORDER BY FaturamentoTotal DESC";

        using var connection = _connectionFactory.CreateConnection();

        // Modelo interno para receber dados brutos antes do enriquecimento Pareto
        var brutos = (await connection.QueryAsync<ProdutoBrutoAbc>(sql, new { TenantId = tenantId })).ToList();

        if (!brutos.Any())
            return new BiCurvaAbcResponse(0, 0m, Enumerable.Empty<ItemCurvaAbc>());

        var faturamentoGlobal = brutos.Sum(b => b.FaturamentoTotal);
        var ticketMedioGlobal = brutos.Count > 0 ? faturamentoGlobal / brutos.Count : 0m;

        // Classificação Pareto em C# — itens já vêm ordenados DESC por FaturamentoTotal
        decimal acumulado = 0;
        var itensFinal = brutos.Select(b =>
        {
            acumulado += b.FaturamentoTotal;
            var participacao = faturamentoGlobal > 0 ? (b.FaturamentoTotal / faturamentoGlobal) * 100m : 0m;
            var acumuladoPct = faturamentoGlobal > 0 ? (acumulado / faturamentoGlobal) * 100m : 0m;

            var classe = acumuladoPct <= 80m ? "A"
                       : acumuladoPct <= 95m ? "B"
                       : "C";

            return new ItemCurvaAbc(classe, b.Produto, b.QtdVendida, b.FaturamentoTotal,
                                    Math.Round(participacao, 2));
        }).ToList();

        return new BiCurvaAbcResponse(brutos.Count, Math.Round(ticketMedioGlobal, 2), itensFinal);
    }

    // Modelo interno Dapper para receber dados brutos da Curva ABC
    private sealed class ProdutoBrutoAbc
    {
        public string Produto { get; init; } = string.Empty;
        public int QtdVendida { get; init; }
        public decimal FaturamentoTotal { get; init; }
    }
}
