using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Application.Repositories;

public interface ISolicitacaoEnderecoReadRepository
{
    Task<IEnumerable<SolicitacaoEnderecoListResponse>> ObterPorStatusAsync(Guid empresaId, StatusSolicitacao? status);
}
