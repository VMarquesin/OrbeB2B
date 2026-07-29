namespace OrbeB2B.Crm.Application.DTOs;

public record ClienteListResponse(
    Guid Id,
    string Documento,
    string NomeOuRazaoSocial,
    string NomeFantasia,
    string TipoSegmento,
    string NomeCidade,
    string SiglaEstado,
    string StatusCadastro
);
