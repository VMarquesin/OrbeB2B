namespace OrbeB2B.Crm.Application.DTOs;

public record EmpresaCreateRequest(
    Guid CidadeId,
    string Cnpj,
    string RazaoSocial,
    string NomeFantasia,
    string Cep,
    string Logradouro,
    string Numero,
    string Bairro
);
