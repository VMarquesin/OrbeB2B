namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record RegistroClienteRequest(
    Guid CidadeId,
    string Cnpj,
    string RazaoSocial,
    string NomeFantasia,
    string Cep,
    string Logradouro,
    string Numero,
    string Bairro,
    string EmailAcesso,
    string SenhaAcesso
);
