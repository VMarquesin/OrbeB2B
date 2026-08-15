using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Application.DTOs;

public record SolicitacaoEnderecoListResponse(
    Guid Id,
    Guid ClienteId,
    string NomeFantasia,
    string Cep,
    string Uf,
    string Cidade,
    string Bairro,
    string Logradouro,
    string Numero,
    string? Complemento,
    string Motivo,
    StatusSolicitacao Status,
    DateTime DataSolicitacao,
    DateTime? DataAnalise
);
