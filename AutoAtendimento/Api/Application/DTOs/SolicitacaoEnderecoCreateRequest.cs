namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record SolicitacaoEnderecoCreateRequest(
    string Cep,
    string Uf,
    string Cidade,
    string Bairro,
    string Logradouro,
    string Numero,
    string? Complemento,
    string Motivo
);
