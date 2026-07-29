namespace OrbeB2B.Crm.Application.DTOs;

public record EmpresaListResponse(
    Guid Id,
    string Cnpj,
    string RazaoSocial,
    string NomeFantasia,
    bool EstaAtiva,
    DateTime DataCadastro
);
