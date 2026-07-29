using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class CategoriaReadRepository : ICategoriaReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public CategoriaReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<CategoriaListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT id
                  ,nome
            FROM categorias
            WHERE empresa_id = @EmpresaId
            ORDER BY nome";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<CategoriaListResponse>(sql, new { EmpresaId = empresaId });
    }
}
