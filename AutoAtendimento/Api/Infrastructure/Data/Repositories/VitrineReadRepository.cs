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
        const string sql = @"
            SELECT produtos.id
                  ,produtos.codigo_comercial
                  ,produtos.descricao
                  ,produtos.embalagem
                  ,produtos.preco_atacado AS preco
                  ,produtos.imagem_url AS ""ImagemUrl""
                  ,produtos.descricao_detalhada AS ""DescricaoDetalhada""
                  ,COALESCE(
                      ARRAY_AGG(
                          produto_imagens.imagem_url
                          ORDER BY produto_imagens.ordem
                      ) FILTER (WHERE produto_imagens.imagem_url IS NOT NULL),
                      ARRAY[]::text[]
                  ) AS ""Imagens""
            FROM produtos
            LEFT JOIN produto_imagens
                ON produtos.id = produto_imagens.produto_id
            WHERE produtos.empresa_id = @EmpresaId
              AND produtos.esta_ativo = true
            GROUP BY produtos.id
                    ,produtos.codigo_comercial
                    ,produtos.descricao
                    ,produtos.embalagem
                    ,produtos.preco_atacado
                    ,produtos.imagem_url
                    ,produtos.descricao_detalhada
            ORDER BY produtos.descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoVitrineResponse>(
            sql,
            new { EmpresaId = empresaId });
    }

    public async Task<ProdutoVitrineResponse?> ObterProdutoPorIdAsync(
        Guid produtoId,
        Guid? empresaId = null)
    {
        const string sql = @"
            SELECT produtos.id
                  ,produtos.codigo_comercial
                  ,produtos.descricao
                  ,produtos.embalagem
                  ,produtos.preco_atacado AS preco
                  ,produtos.imagem_url AS ""ImagemUrl""
                  ,produtos.descricao_detalhada AS ""DescricaoDetalhada""
                  ,COALESCE(
                      ARRAY_AGG(
                          produto_imagens.imagem_url
                          ORDER BY produto_imagens.ordem
                      ) FILTER (WHERE produto_imagens.imagem_url IS NOT NULL),
                      ARRAY[]::text[]
                  ) AS ""Imagens""
            FROM produtos
            LEFT JOIN produto_imagens
                ON produtos.id = produto_imagens.produto_id
            WHERE produtos.id = @ProdutoId
              AND (@EmpresaId IS NULL OR produtos.empresa_id = @EmpresaId)
              AND produtos.esta_ativo = true
            GROUP BY produtos.id
                    ,produtos.codigo_comercial
                    ,produtos.descricao
                    ,produtos.embalagem
                    ,produtos.preco_atacado
                    ,produtos.imagem_url
                    ,produtos.descricao_detalhada
            LIMIT 1";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<ProdutoVitrineResponse>(
            sql,
            new
            {
                ProdutoId = produtoId,
                EmpresaId = empresaId
            });
    }

    public async Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosPublicosAsync(
        Guid? empresaId = null)
    {
        const string sql = @"
            SELECT produtos.id
                  ,produtos.codigo_comercial
                  ,produtos.descricao
                  ,produtos.embalagem
                  ,produtos.preco_atacado AS preco
                  ,produtos.imagem_url AS ""ImagemUrl""
                  ,produtos.descricao_detalhada AS ""DescricaoDetalhada""
                  ,COALESCE(
                      ARRAY_AGG(
                          produto_imagens.imagem_url
                          ORDER BY produto_imagens.ordem
                      ) FILTER (WHERE produto_imagens.imagem_url IS NOT NULL),
                      ARRAY[]::text[]
                  ) AS ""Imagens""
            FROM produtos
            LEFT JOIN produto_imagens
                ON produtos.id = produto_imagens.produto_id
            WHERE (@EmpresaId IS NULL OR produtos.empresa_id = @EmpresaId)
              AND produtos.esta_ativo = true
            GROUP BY produtos.id
                    ,produtos.codigo_comercial
                    ,produtos.descricao
                    ,produtos.embalagem
                    ,produtos.preco_atacado
                    ,produtos.imagem_url
                    ,produtos.descricao_detalhada
            ORDER BY produtos.descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoVitrineResponse>(
            sql,
            new { EmpresaId = empresaId });
    }

    public async Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosPorCategoriaAsync(
        Guid empresaId,
        Guid? categoriaId)
    {
        const string sql = @"
            SELECT p.id
                  ,p.codigo_comercial
                  ,p.descricao
                  ,p.embalagem
                  ,p.preco_atacado AS preco
                  ,p.imagem_url AS ""ImagemUrl""
                  ,p.descricao_detalhada AS ""DescricaoDetalhada""
                  ,COALESCE(
                      ARRAY_AGG(
                          produto_imagens.imagem_url
                          ORDER BY produto_imagens.ordem
                      ) FILTER (WHERE produto_imagens.imagem_url IS NOT NULL),
                      ARRAY[]::text[]
                  ) AS ""Imagens""
            FROM produtos p
            LEFT JOIN produto_imagens
                ON p.id = produto_imagens.produto_id
            WHERE p.empresa_id = @EmpresaId
              AND p.esta_ativo = true
              AND (@CategoriaId IS NULL OR p.categoria_id = @CategoriaId)
            GROUP BY p.id
                    ,p.codigo_comercial
                    ,p.descricao
                    ,p.embalagem
                    ,p.preco_atacado
                    ,p.imagem_url
                    ,p.descricao_detalhada
            ORDER BY p.descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoVitrineResponse>(
            sql,
            new
            {
                EmpresaId = empresaId,
                CategoriaId = categoriaId
            });
    }

    public async Task<IEnumerable<CategoriaVitrineResponse>> ObterCategoriasAsync(Guid empresaId)
    {
        // Retorna apenas categorias que possuem ao menos um produto ativo
        const string sql = @"
            SELECT DISTINCT c.id
                          ,c.nome
            FROM categorias c
            INNER JOIN produtos p
                ON p.categoria_id = c.id
            WHERE c.empresa_id = @EmpresaId
              AND p.esta_ativo = true
            ORDER BY c.nome";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<CategoriaVitrineResponse>(
            sql,
            new { EmpresaId = empresaId });
    }
}