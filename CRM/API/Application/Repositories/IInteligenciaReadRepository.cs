using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Repositories;

public interface IInteligenciaReadRepository
{
    Task<DashboardPrincipalResponse> ObterDashboardPrincipalAsync(Guid tenantId);
    Task<HistoricoFaturamentoResponse> ObterHistoricoFaturamentoAsync(Guid tenantId, DateTime? dataInicio, DateTime? dataFim);
    Task<BiCurvaAbcResponse> ObterCurvaAbcProdutosAsync(Guid tenantId);
}
