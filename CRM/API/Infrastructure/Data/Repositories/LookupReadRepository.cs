using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class LookupReadRepository : ILookupReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public LookupReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<PerfilLookupResponse>> ObterPerfisAsync()
    {
        var sql = @"
            SELECT id
                  ,nome_perfil
                  ,descricao
            FROM perfis_usuario
            ORDER BY nome_perfil";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<PerfilLookupResponse>(sql);
    }

    public async Task<IEnumerable<EstadoLookupResponse>> ObterEstadosAsync()
    {
        var sql = @"
            SELECT id
                  ,sigla
                  ,nome
            FROM estados
            ORDER BY sigla";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<EstadoLookupResponse>(sql);
    }

    public async Task<IEnumerable<CidadeLookupResponse>> ObterCidadesPorEstadoAsync(Guid estadoId)
    {
        var sql = @"
            SELECT id
                  ,nome
                  ,estado_id
            FROM cidades
            WHERE estado_id = @EstadoId
            ORDER BY nome";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<CidadeLookupResponse>(sql, new { EstadoId = estadoId });
    }
}
