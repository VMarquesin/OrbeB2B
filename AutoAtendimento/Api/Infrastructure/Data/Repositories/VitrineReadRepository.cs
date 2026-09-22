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
            SELECT id
                  ,codigo_comercial
                  ,descricao
                  ,embalagem
                  ,preco_atacado      AS preco
                  ,descricao_detalhada
            FROM produtos
            WHERE empresa_id = @EmpresaId
              AND esta_ativo = true
            ORDER BY descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoVitrineResponse>(sql, new { EmpresaId = empresaId });
    }

    public async Task<ProdutoVitrineResponse?> ObterProdutoPorIdAsync(Guid produtoId, Guid? empresaId = null)
    {
        const string sql = @"
            SELECT id
                  ,codigo_comercial
                  ,descricao
                  ,embalagem
                  ,preco_atacado      AS preco
                  ,descricao_detalhada
            FROM produtos
            WHERE id = @ProdutoId
              AND (@EmpresaId IS NULL OR empresa_id = @EmpresaId)
              AND esta_ativo = true
            LIMIT 1";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryFirstOrDefaultAsync<ProdutoVitrineResponse>(
            sql, new { ProdutoId = produtoId, EmpresaId = empresaId });
    }

    public async Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosPublicosAsync(Guid? empresaId = null)
    {
        // Se empresaId for fornecido, filtra por ele; caso contrário, busca de todas as empresas ativas ou padrão
        const string sql = @"
            SELECT id
                  ,codigo_comercial
                  ,descricao
                  ,embalagem
                  ,preco_atacado      AS preco
                  ,descricao_detalhada
            FROM produtos
            WHERE (@EmpresaId IS NULL OR empresa_id = @EmpresaId)
              AND esta_ativo = true
            ORDER BY descricao";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ProdutoVitrineResponse>(sql, new { EmpresaId = empresaId });
    }

    public async Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosPorCategoriaAsync(Guid empresaId, Guid? categoriaId)
    {
        const string sql = @"
            SELECT p.id
                  ,p.codigo_comercial
                  ,p.descricao
                  ,p.embalagem
                  ,p.preco_atacado      AS preco
                  ,p.descricao_detalhada
            FROM produtos p
            WHERE p.empresa_id = @EmpresaId
              AND p.esta_ativo = true
              AND (@CategoriaId IS NULL OR p.categoria_id = @CategoriaId)
            ORDER BY p.descricao";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<ProdutoVitrineResponse>(
            sql, new { EmpresaId = empresaId, CategoriaId = categoriaId });
    }

    public async Task<IEnumerable<CategoriaVitrineResponse>> ObterCategoriasAsync(Guid empresaId)
    {
        // Retorna apenas categorias que possuem ao menos um produto ativo
        const string sql = @"
            SELECT DISTINCT c.id
                           ,c.nome
            FROM categorias c
            INNER JOIN produtos p ON p.categoria_id = c.id
            WHERE c.empresa_id = @EmpresaId
              AND p.esta_ativo = true
            ORDER BY c.nome";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<CategoriaVitrineResponse>(sql, new { EmpresaId = empresaId });
    }
}
