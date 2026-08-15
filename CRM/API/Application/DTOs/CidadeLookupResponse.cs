namespace OrbeB2B.Crm.Application.DTOs;

public record CidadeLookupResponse(
    Guid Id,
    string Nome,
    Guid EstadoId
);
