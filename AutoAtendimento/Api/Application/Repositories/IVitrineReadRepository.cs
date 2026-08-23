using OrbeB2B.AutoAtendimento.Application.DTOs;

namespace OrbeB2B.AutoAtendimento.Application.Repositories;

public interface IVitrineReadRepository
{
    Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosAsync(Guid empresaId);
    Task<ProdutoVitrineResponse?> ObterProdutoPorIdAsync(Guid produtoId, Guid? empresaId = null);
    Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosPublicosAsync(Guid? empresaId = null);
}
