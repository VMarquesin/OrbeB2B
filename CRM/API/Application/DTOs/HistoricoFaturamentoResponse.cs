using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Application.DTOs;

public record PedidoHistoricoItem(
    DateTime Data,
    string Codigo,
    string ClienteNome,
    decimal ValorFechado,
    StatusIntegracaoErp StatusErp
);

public record HistoricoFaturamentoResponse(
    decimal ReceitaPeriodo,
    int VolumeOrcamentos,
    decimal TicketMedio,
    IEnumerable<PedidoHistoricoItem> HistoricoPedidos
);
