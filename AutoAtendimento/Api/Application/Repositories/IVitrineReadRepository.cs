using OrbeB2B.AutoAtendimento.Application.DTOs;

namespace OrbeB2B.AutoAtendimento.Application.Repositories;

public interface IVitrineReadRepository
{
    Task<IEnumerable<ProdutoVitrineResponse>> ObterProdutosAtivosAsync(Guid empresaId);
}
