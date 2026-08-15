namespace OrbeB2B.Crm.Application.DTOs;

public record LoginResponse(
    string Token,
    Guid UsuarioId,
    string Nome,
    string Email,
    Guid EmpresaId,
    string Perfil
);
