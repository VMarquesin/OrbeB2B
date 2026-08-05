using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.Models;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class AuthReadRepository : IAuthReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AuthReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<UsuarioAuthModel?> ObterUsuarioParaLoginAsync(string email)
    {
        var sql = @"
            SELECT usuarios.id
                  ,usuarios.nome
                  ,usuarios.email
                  ,usuarios.senha_hash
                  ,usuarios.esta_ativo
                  ,empresa_funcionarios.empresa_id
                  ,perfis_usuario.nome_perfil
            FROM usuarios
            INNER JOIN empresa_funcionarios
                ON usuarios.id = empresa_funcionarios.usuario_id
            INNER JOIN perfis_usuario
                ON usuarios.perfil_id = perfis_usuario.id
            WHERE usuarios.email = @Email
            LIMIT 1";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<UsuarioAuthModel>(sql, new { Email = email });
    }
}
