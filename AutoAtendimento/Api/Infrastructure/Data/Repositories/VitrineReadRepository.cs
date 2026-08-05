using Dapper;
using OrbeB2B.AutoAtendimento.Application.DTOs;
using OrbeB2B.AutoAtendimento.Application.Repositories;
using OrbeB2B.Crm.Application.Data;

namespace OrbeB2B.AutoAtendimento.Infrastructure.Data.Repositories;

public class VitrineReadRepository : IVitrineReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public VitrineReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosAsync(Guid empresaId)
    {
        var sql = @"
            SELECT id
                  ,codigo_comercial
                  ,descricao
                  ,embalagem
                  ,preco_atacado AS preco
            FROM produtos
            WHERE empresa_id = @EmpresaId
              AND esta_ativo = true
            ORDER BY descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoVitrineResponse>(sql, new { EmpresaId = empresaId });
    }
}
