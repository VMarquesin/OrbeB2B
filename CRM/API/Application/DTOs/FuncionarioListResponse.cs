namespace OrbeB2B.Crm.Application.DTOs;

public record FuncionarioListResponse(
    Guid UsuarioId,
    string Nome,
    string Email,
    string Cargo,
    string Departamento,
    DateTime DataAdmissao
);
