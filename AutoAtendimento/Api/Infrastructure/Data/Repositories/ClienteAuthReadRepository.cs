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

    /// <summary>
    /// Busca o comprador pelo CNPJ do cliente:
    ///   clientes → usuarios (via usuarios.cliente_id = clientes.id)
    ///
    /// O JOIN garante que só usuários CompradorB2B (com cliente_id preenchido)
    /// consigam logar por este endpoint — colaboradores do CRM são excluídos
    /// naturalmente pois não têm cliente_id.
    /// </summary>
    public async Task<CompradorAuthModel?> ObterCompradorPorCnpjAsync(string cnpj)
    {
        // Remove formatação antes de buscar (front pode enviar "12.345.678/0001-90")
        var cnpjLimpo = new string(cnpj.Where(char.IsDigit).ToArray());

        const string sql = @"
            SELECT
                usuarios.id,
                usuarios.nome,
                usuarios.email,
                usuarios.senha_hash,
                usuarios.esta_ativo,
                usuarios.cliente_id,
                clientes.empresa_id,
                clientes.nome_ou_razao_social AS nome_cliente
            FROM clientes
            INNER JOIN usuarios
                ON usuarios.cliente_id = clientes.id
            WHERE clientes.documento = @Cnpj
            LIMIT 1";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<CompradorAuthModel>(sql, new { Cnpj = cnpjLimpo });
    }
}
