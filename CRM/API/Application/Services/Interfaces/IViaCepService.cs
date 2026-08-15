using OrbeB2B.Crm.Application.DTOs;

namespace OrbeB2B.Crm.Application.Services.Interfaces;

public interface IViaCepService
{
    Task<CepIntegracaoResponse?> ConsultarCepAsync(string cep);
}
