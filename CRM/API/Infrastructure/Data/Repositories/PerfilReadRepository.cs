using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class PerfilReadRepository : IPerfilReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PerfilReadRepository(IDbConnectionFactory connectionFactory)
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
            WHERE sistema = 'CRM'
            ORDER BY nome_perfil";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<PerfilLookupResponse>(sql);
    }

    public async Task<IEnumerable<PermissaoPerfilResponse>> ObterPermissoesPorPerfilAsync(Guid perfilId)
    {
        var sql = @"
            SELECT id
                  ,perfil_id
                  ,area
            FROM permissoes_perfil
            WHERE perfil_id = @PerfilId
            ORDER BY area";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<PermissaoPerfilResponse>(
            sql,
            new { PerfilId = perfilId });
    }
}