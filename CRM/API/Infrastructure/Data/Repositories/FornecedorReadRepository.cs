using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class FornecedorReadRepository : IFornecedorReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FornecedorReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<FornecedorListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT id
                  ,cnpj
                  ,razao_social
                  ,esta_ativo
                  ,data_cadastro
            FROM fornecedores
            WHERE empresa_id = @EmpresaId
            ORDER BY razao_social";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<FornecedorListResponse>(sql, new { EmpresaId = empresaId });
    }
}
