using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class EmpresaReadRepository : IEmpresaReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public EmpresaReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<EmpresaListResponse>> ObterTodasAsync()
    {
        var sql = @"
            SELECT id
                  ,cnpj
                  ,razao_social
                  ,nome_fantasia
                  ,esta_ativa
                  ,data_cadastro
            FROM empresas
            ORDER BY razao_social";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<EmpresaListResponse>(sql);
    }
}
