using OrbeB2B.Crm.Domain.Enums;

namespace OrbeB2B.Crm.Application.DTOs;

public record ClienteCreateRequest(
    Guid CidadeId,
    string Documento,
    string NomeOuRazaoSocial,
    string NomeFantasia,
    TipoSegmentoCliente TipoSegmento,
    string Cep,
    string Logradouro,
    string Numero,
    string Bairro
);
