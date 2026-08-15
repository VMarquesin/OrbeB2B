namespace OrbeB2B.Crm.Application.DTOs;

public record ItemCurvaAbc(
    string ClassificacaoPareto,   // "A", "B" ou "C"
    string Produto,
    int QtdVendida,
    decimal FaturamentoTotal,
    decimal ParticipacaoPercentual
);

public record BiCurvaAbcResponse(
    int VolumeAnalisado,
    decimal TicketMedioGlobal,
    IEnumerable<ItemCurvaAbc> ItensCurvaAbc
);
