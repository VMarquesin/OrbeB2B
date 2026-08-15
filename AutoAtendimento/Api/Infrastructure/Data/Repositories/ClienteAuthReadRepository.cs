using Dapper;
using OrbeB2B.AutoAtendimento.Application.Models;
using OrbeB2B.AutoAtendimento.Application.Repositories;
using OrbeB2B.Crm.Application.Data;

namespace OrbeB2B.AutoAtendimento.Infrastructure.Data.Repositories;

public class ClienteAuthReadRepository : IClienteAuthReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ClienteAuthReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<CompradorAuthModel?> ObterCompradorParaLoginAsync(string email)
    {
        var sql = @"
            SELECT usuarios.id
                  ,usuarios.nome
                  ,usuarios.email
                  ,usuarios.senha_hash
                  ,usuarios.esta_ativo
                  ,usuarios.cliente_id
                  ,clientes.empresa_id
                  ,clientes.nome_ou_razao_social AS nome_cliente
            FROM usuarios
            INNER JOIN clientes
                ON usuarios.cliente_id = clientes.id
            WHERE usuarios.email = @Email
            LIMIT 1";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<CompradorAuthModel>(sql, new { Email = email });
    }
}
