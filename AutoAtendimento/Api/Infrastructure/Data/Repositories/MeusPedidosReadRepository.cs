using Dapper;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.AutoAtendimento.Application.Repositories;
using OrbeB2B.Crm.Application.Data;

namespace OrbeB2B.AutoAtendimento.Infrastructure.Data.Repositories;

public class MeusPedidosReadRepository : IMeusPedidosReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MeusPedidosReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<MeuPedidoResumoResponse>> ObterHistoricoAsync(Guid clienteId)
    {
        var sql = @"
            SELECT id
                  ,codigo_pedido_formatado
                  ,data_criacao
                  ,valor_total_pedido
                  ,status_logistica
                  ,status_erp
            FROM pedidos
            WHERE cliente_id = @ClienteId
            ORDER BY data_criacao DESC";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<MeuPedidoResumoResponse>(sql, new { ClienteId = clienteId });
    }

    public async Task<MeuPedidoDetalheResponse?> ObterDetalhesAsync(Guid pedidoId, Guid clienteId)
    {
        var sqlCapa = @"
            SELECT id
                  ,codigo_pedido_formatado
                  ,data_criacao
                  ,valor_total_pedido
                  ,status_logistica
                  ,status_erp
                  ,observacao_negociacao
            FROM pedidos
            WHERE id = @PedidoId
              AND cliente_id = @ClienteId";

        var sqlItens = @"
            SELECT pedido_itens.produto_id
                  ,produtos.codigo_comercial
                  ,produtos.descricao
                  ,pedido_itens.quantidade_solicitada
                  ,pedido_itens.preco_unitario_aplicado
                  ,pedido_itens.quantidade_solicitada * pedido_itens.preco_unitario_aplicado AS subtotal
            FROM pedido_itens
            INNER JOIN produtos
                ON pedido_itens.produto_id = produtos.id
            WHERE pedido_itens.pedido_id = @PedidoId";

        using var connection = _connectionFactory.CreateConnection();

        using var multi = await connection.QueryMultipleAsync(
            $"{sqlCapa};\n{sqlItens}",
            new { PedidoId = pedidoId, ClienteId = clienteId }
        );

        var capa = await multi.ReadFirstOrDefaultAsync<dynamic>();

        if (capa is null)
            return null;

        var itens = (await multi.ReadAsync<MeuPedidoItemResponse>()).ToList();

        return new MeuPedidoDetalheResponse(
            Id: (Guid)capa.id,
            CodigoPedidoFormatado: (string)capa.codigo_pedido_formatado,
            DataCriacao: (DateTime)capa.data_criacao,
            ValorTotalPedido: (decimal)capa.valor_total_pedido,
            StatusLogistica: (OrbeB2B.Crm.Domain.Enums.StatusFilaLogistica)(int)capa.status_logistica,
            StatusErp: (OrbeB2B.Crm.Domain.Enums.StatusIntegracaoErp)(int)capa.status_erp,
            ObservacaoNegociacao: (string)capa.observacao_negociacao,
            Itens: itens
        );
    }

    public async Task<IEnumerable<SimulacaoRecompraItemResponse>> ObterSimulacaoRecompraAsync(Guid pedidoId, Guid clienteId)
    {
        var sql = @"
            SELECT produtos.id                              AS produto_id
                  ,produtos.codigo_comercial
                  ,produtos.descricao
                  ,pedido_itens.quantidade_solicitada       AS quantidade_historica
                  ,produtos.preco_atacado                   AS preco_atual
                  ,produtos.esta_ativo
            FROM pedido_itens
            INNER JOIN pedidos
                ON pedido_itens.pedido_id = pedidos.id
            INNER JOIN produtos
                ON pedido_itens.produto_id = produtos.id
            WHERE pedidos.id         = @PedidoId
              AND pedidos.cliente_id = @ClienteId
            ORDER BY produtos.descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<SimulacaoRecompraItemResponse>(
            sql,
            new { PedidoId = pedidoId, ClienteId = clienteId }
        );
    }
}
