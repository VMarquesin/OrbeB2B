using Dapper;
using OrbeB2B.Crm.Application.Data;
using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;

namespace OrbeB2B.Crm.Infrastructure.Data.Repositories;

public class ProdutoReadRepository : IProdutoReadRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ProdutoReadRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<ProdutoListResponse>> ObterTodosPorEmpresaAsync(Guid empresaId)
    {
        var sql = @"
            SELECT produtos.id
                  ,produtos.codigo_comercial
                  ,produtos.descricao
                  ,produtos.embalagem
                  ,produtos.fornecedor_id
                  ,produtos.eh_fabricacao_propria
                  ,produtos.preco_atacado
                  ,produtos.preco_lojista
                  ,produtos.preco_varejo
                  ,produtos.esta_ativo
                  ,categorias.nome AS nome_categoria
            FROM produtos
            INNER JOIN categorias
                ON produtos.categoria_id = categorias.id
            WHERE produtos.empresa_id = @EmpresaId
            ORDER BY produtos.descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoListResponse>(sql, new { EmpresaId = empresaId });
    }
}
