using Microsoft.Extensions.Configuration;
using Npgsql;
using OrbeB2B.Crm.Application.Data;
using System.Data;

namespace OrbeB2B.Crm.Infrastructure.Data;

public class PgSqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public PgSqlConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string não encontrada.");
    }

    public IDbConnection CreateConnection()
    {
        var connection = new NpgsqlConnection(_connectionString);
        connection.Open();
        return connection;
    }
}