using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class PedidoReadRepository : IPedidoReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PedidoReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<PedidoResumoListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT p.id
                  ,p.codigo_pedido_formatado
                  ,COALESCE(c.nome_ou_razao_social, 'Consumidor Final') AS nome_cliente
                  ,p.valor_total_pedido
                  ,p.status_logistica                                   AS status_logistica_int
                  ,p.origem
                  ,p.data_criacao
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.cliente_id = c.id
            WHERE p.empresa_id = @EmpresaId
            ORDER BY p.data_criacao DESC";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<PedidoResumoListResponse>(sql, new { EmpresaId = empresaId });
    }

    public async Task<PedidoDetalheResponse?> ObterDetalhePorIdAsync(Guid id, Guid empresaId)
    {
        // Consulta 1: cabeçalho do pedido
        var sqlCabecalho = @"
            SELECT p.id
                  ,p.codigo_pedido_formatado
                  ,COALESCE(c.nome_ou_razao_social, 'Consumidor Final') AS nome_cliente
                  ,p.origem
                  ,p.observacao_negociacao
                  ,p.valor_total_pedido
                  ,p.status_logistica                                   AS status_logistica_int
                  ,p.data_criacao
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.cliente_id = c.id
            WHERE p.id = @Id
              AND p.empresa_id = @EmpresaId";

        // Consulta 2: itens do pedido (com nome do produto via JOIN)
        var sqlItens = @"
            SELECT pi.id
                  ,pi.produto_id
                  ,COALESCE(pr.descricao, 'Produto Desconhecido')       AS nome_produto
                  ,pi.quantidade_solicitada                             AS quantidade
                  ,pi.preco_unitario_aplicado                          AS preco_unitario
                  ,pi.eh_fabricacao_propria_snapshot                   AS eh_fabricacao_propria
            FROM pedido_itens pi
            LEFT JOIN produtos pr
                ON pi.produto_id = pr.id
            WHERE pi.pedido_id = @Id";

        using var connection = _connectionFactory.CreateConnection();

        var pedido = await connection.QueryFirstOrDefaultAsync<PedidoDetalheResponse>(
            sqlCabecalho, new { Id = id, EmpresaId = empresaId });

        if (pedido is null) return null;

        var itens = await connection.QueryAsync<PedidoItemDetalheResponse>(
            sqlItens, new { Id = id });

        pedido.Itens.AddRange(itens);

        return pedido;
    }
}
