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
            SELECT pedidos.id
                  ,pedidos.codigo_pedido_formatado
                  ,clientes.nome_ou_razao_social AS nome_cliente
                  ,pedidos.valor_total_pedido
                  ,pedidos.status_logistica
                  ,pedidos.data_criacao
            FROM pedidos
            INNER JOIN clientes
                ON pedidos.cliente_id = clientes.id
            WHERE pedidos.empresa_id = @EmpresaId
            ORDER BY pedidos.data_criacao DESC";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<PedidoResumoListResponse>(sql, new { EmpresaId = empresaId });
    }
}
