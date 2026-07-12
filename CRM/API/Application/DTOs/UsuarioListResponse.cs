namespace OrbeB2B.Crm.Application.DTOs;

// Usamos record para leitura pois é imutável e super leve
public record UsuarioListResponse(
    Guid Id, 
    string Nome, 
    string Email, 
    string NomePerfil, 
    bool EstaAtivo
);