using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class EmpresaFuncionarioReadRepository : IEmpresaFuncionarioReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public EmpresaFuncionarioReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<FuncionarioListResponse>> ObterEquipePorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT usuarios.id           AS usuario_id
                  ,usuarios.nome
                  ,usuarios.email
                  ,empresa_funcionarios.cargo
                  ,empresa_funcionarios.departamento
                  ,empresa_funcionarios.data_admissao
            FROM empresa_funcionarios
            INNER JOIN usuarios
                ON empresa_funcionarios.usuario_id = usuarios.id
            WHERE empresa_funcionarios.empresa_id = @EmpresaId
            ORDER BY usuarios.nome";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<FuncionarioListResponse>(sql, new { EmpresaId = empresaId });
    }
}
