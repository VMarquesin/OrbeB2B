using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class ClienteReadRepository : IClienteReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ClienteReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ClienteListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT clientes.id
                  ,clientes.documento
                  ,clientes.nome_ou_razao_social
                  ,clientes.nome_fantasia
                  ,clientes.tipo_segmento
                  ,cidades.nome            AS nome_cidade
                  ,estados.sigla           AS sigla_estado
                  ,clientes.status_cadastro
            FROM clientes
            INNER JOIN cidades
                ON clientes.cidade_id = cidades.id
            INNER JOIN estados
                ON cidades.estado_id = estados.id
            WHERE clientes.empresa_id = @EmpresaId
            ORDER BY clientes.nome_ou_razao_social";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ClienteListResponse>(sql, new { EmpresaId = empresaId });
    }
}
