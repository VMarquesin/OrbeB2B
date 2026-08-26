using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class UsuarioReadRepository : IUsuarioReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UsuarioReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<UsuarioListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId, bool incluirInativos = false)
    {
        var sql = @"
            SELECT usuarios.id                          AS Id
                  ,usuarios.nome                        AS Nome
                  ,usuarios.email                       AS Email
                  ,perfis_usuario.nome_perfil           AS NomePerfil
                  ,usuarios.esta_ativo                  AS EstaAtivo
                  ,empresa_funcionarios.cargo           AS Cargo
                  ,empresa_funcionarios.departamento    AS Departamento
                  ,empresa_funcionarios.data_admissao   AS DataAdmissao
            FROM usuarios
            INNER JOIN empresa_funcionarios 
            ON usuarios.id = empresa_funcionarios.usuario_id
            INNER JOIN perfis_usuario 
            ON usuarios.perfil_id = perfis_usuario.id
            WHERE empresa_funcionarios.empresa_id = @EmpresaId
              AND (@IncluirInativos = true OR usuarios.esta_ativo = true)
            ORDER BY usuarios.nome";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<UsuarioListResponse>(sql, new { EmpresaId = empresaId, IncluirInativos = incluirInativos });
    }
}