namespace OrbeB2B.Crm.Application.DTOs;

public record UsuarioCreateRequest(
    string Nome, 
    string Email, 
    string Senha, 
    Guid PerfilId,
    string Cargo,
    string Departamento
);