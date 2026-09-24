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
              ,produtos.descricao_detalhada AS descricao_detalhada 
              ,produtos.imagem_url
              ,produtos.embalagem
              ,produtos.fornecedor_id
              ,produtos.eh_fabricacao_propria
              ,produtos.preco_atacado
              ,produtos.preco_lojista
              ,produtos.preco_varejo
              ,produtos.esta_ativo
              ,categorias.nome AS nome_categoria
              ,COALESCE(
                  ARRAY_AGG(
                      produto_imagens.imagem_url
                      ORDER BY produto_imagens.ordem
                  ) FILTER (WHERE produto_imagens.imagem_url IS NOT NULL),
                  ARRAY[]::text[]
              ) AS imagens
        FROM produtos
        LEFT JOIN categorias
            ON produtos.categoria_id = categorias.id
        LEFT JOIN produto_imagens
            ON produtos.id = produto_imagens.produto_id
        WHERE produtos.empresa_id = @EmpresaId
        GROUP BY produtos.id
                ,produtos.codigo_comercial
                ,produtos.descricao
                ,produtos.descricao_detalhada
                ,produtos.imagem_url
                ,produtos.embalagem
                ,produtos.fornecedor_id
                ,produtos.eh_fabricacao_propria
                ,produtos.preco_atacado
                ,produtos.preco_lojista
                ,produtos.preco_varejo
                ,produtos.esta_ativo
                ,categorias.nome
        ORDER BY produtos.descricao";

    using var connection = _connectionFactory.CreateConnection();

    return await connection.QueryAsync<ProdutoListResponse>(
        sql,
        new { EmpresaId = empresaId });
    }
}
