namespace OrbeB2B.Crm.Application.DTOs;

public record PedidoCreateRequest(
    // Nullable → pedidos de Pessoa Física sem cadastro enviam null ou omitem o campo
    Guid? ClienteId,
    string ObservacaoNegociacao,
    List<PedidoItemCreateRequest> Itens
);
