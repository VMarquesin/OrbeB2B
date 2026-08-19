namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record PerfilClienteResponse(
    string Nome,
    string RazaoSocial,
    string NomeFantasia,
    string Cnpj,
    string Email,
    string Telefone,
    string Cep,
    string Logradouro,
    string Numero,
    string Bairro,
    string Cidade,
    string Uf
);
