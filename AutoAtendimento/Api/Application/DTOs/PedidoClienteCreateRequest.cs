using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record PedidoClienteCreateRequest(
    string ObservacaoNegociacao,
    List<PedidoClienteItemRequest> Itens,
    FormaPagamento FormaPagamento = FormaPagamento.NaoInformada
);
