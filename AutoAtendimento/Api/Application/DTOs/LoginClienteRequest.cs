namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record LoginClienteRequest(
    string Cnpj,
    string Senha
);
