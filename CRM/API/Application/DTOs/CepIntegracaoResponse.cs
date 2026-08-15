namespace OrbeB2B.Crm.Application.DTOs;

public record CepIntegracaoResponse(
    string Logradouro,
    string Bairro,
    string CidadeNome,
    string Uf,
    Guid? CidadeId,
    Guid? EstadoId
);
