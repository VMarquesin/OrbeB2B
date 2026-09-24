namespace OrbeB2B.Crm.Application.DTOs;

public record PerfilCreateRequest(
    string NomePerfil,
    string Descricao,
    string Sistema,
    IEnumerable<string> Areas
);