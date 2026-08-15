namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record PedidoClienteCreateRequest(
    string ObservacaoNegociacao,
    List<PedidoClienteItemRequest> Itens
);
