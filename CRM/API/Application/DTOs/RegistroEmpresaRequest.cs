namespace OrbeB2B.Crm.Application.DTOs;

public record RegistroEmpresaRequest(
    Guid CidadeId,
    string Cnpj,
    string RazaoSocial,
    string NomeFantasia,
    string Cep,
    string Logradouro,
    string Numero,
    string Bairro,
    string NomeResponsavel,
    string Email,
    string Senha
);