using OrbeB2B.Crm.Application.DTOs;
using OrbeB2B.Crm.Application.Repositories;
using OrbeB2B.Crm.Application.Services.Interfaces;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace OrbeB2B.Crm.Infrastructure.Services;

public class ViaCepService : IViaCepService
{
    private readonly HttpClient _httpClient;
    private readonly ILookupReadRepository _lookupRepository;

    public ViaCepService(HttpClient httpClient, ILookupReadRepository lookupRepository)
    {
        _httpClient = httpClient;
        _lookupRepository = lookupRepository;
    }

    public async Task<CepIntegracaoResponse?> ConsultarCepAsync(string cep)
    {
        var cepNumerico = new string(cep.Where(char.IsDigit).ToArray());

        if (cepNumerico.Length != 8)
            return null;

        HttpResponseMessage httpResponse;

        try
        {
            httpResponse = await _httpClient.GetAsync($"https://viacep.com.br/ws/{cepNumerico}/json/");
        }
        catch
        {
            return null;
        }

        if (!httpResponse.IsSuccessStatusCode)
            return null;

        var json = await httpResponse.Content.ReadAsStringAsync();

        var viaCepResult = JsonSerializer.Deserialize<ViaCepResultado>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        // ViaCEP retorna { "erro": true } para CEPs inválidos
        if (viaCepResult is null || viaCepResult.Erro)
            return null;

        // Cruza os dados com a base local: UF → Estado → Cidade
        Guid? estadoId = null;
        Guid? cidadeId = null;

        var estados = await _lookupRepository.ObterEstadosAsync();
        var estado = estados.FirstOrDefault(e =>
            string.Equals(e.Sigla, viaCepResult.Uf, StringComparison.OrdinalIgnoreCase));

        if (estado is not null)
        {
            estadoId = estado.Id;

            var cidades = await _lookupRepository.ObterCidadesPorEstadoAsync(estado.Id);
            var cidade = cidades.FirstOrDefault(c =>
                string.Equals(c.Nome, viaCepResult.Localidade, StringComparison.OrdinalIgnoreCase));

            if (cidade is not null)
                cidadeId = cidade.Id;
        }

        return new CepIntegracaoResponse(
            Logradouro: viaCepResult.Logradouro,
            Bairro: viaCepResult.Bairro,
            CidadeNome: viaCepResult.Localidade,
            Uf: viaCepResult.Uf,
            CidadeId: cidadeId,
            EstadoId: estadoId
        );
    }

    // Modelo interno para deserializar a resposta do ViaCEP
    private sealed class ViaCepResultado
    {
        public string Logradouro { get; init; } = string.Empty;
        public string Bairro { get; init; } = string.Empty;
        public string Localidade { get; init; } = string.Empty;
        public string Uf { get; init; } = string.Empty;

        [JsonPropertyName("erro")]
        public bool Erro { get; init; }
    }
}
