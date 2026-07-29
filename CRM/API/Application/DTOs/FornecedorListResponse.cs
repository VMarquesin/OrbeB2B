namespace OrbeB2B.Crm.Application.DTOs;

public record FornecedorListResponse(
    Guid Id,
    string Cnpj,
    string RazaoSocial,
    bool EstaAtivo,
    DateTime DataCadastro
);
