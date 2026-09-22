namespace OrbeB2B.AutoAtendimento.Application.DTOs;

/// <summary>
/// Categoria de produto para o filtro da vitrine B2B.
/// </summary>
public record CategoriaVitrineResponse(
    Guid Id,
    string Nome
);
