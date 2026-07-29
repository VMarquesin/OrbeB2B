namespace OrbeB2B.Crm.Application.DTOs;

public record PedidoCreateRequest(
    Guid ClienteId,
    string ObservacaoNegociacao,
    List<PedidoItemCreateRequest> Itens
);
