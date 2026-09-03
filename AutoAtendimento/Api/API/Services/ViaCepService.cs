using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using OrbeB2B.Crm.Infrastructure.Data;

namespace OrbeB2B.AutoAtendimento.Api.Services;

public class ViaCepService
{
    private readonly HttpClient _httpClient;
    private readonly CrmDbContext _context;

    public ViaCepService(HttpClient httpClient, CrmDbContext context)
    {
        _httpClient = httpClient;
        _context = context;
    }

    public async Task<CepResultado?> ConsultarCepAsync(string cep)
    {
        var cepNumerico = new string(cep.Where(char.IsDigit).ToArray());

        if (cepNumerico.Length != 8)
            return null;

        HttpResponseMessage response;

        try
        {
            response = await _httpClient.GetAsync(
                $"https://viacep.com.br/ws/{cepNumerico}/json/"
            );
        }
        catch
        {
            return null;
        }

        if (!response.IsSuccessStatusCode)
            return null;

        var json = await response.Content.ReadAsStringAsync();

        var viaCep = JsonSerializer.Deserialize<ViaCepResponse>(
            json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        );

        if (viaCep is null || viaCep.Erro)
            return null;

        var estado = await _context.Estados
            .AsNoTracking()
            .FirstOrDefaultAsync(e =>
                e.Sigla.ToUpper() == viaCep.Uf.ToUpper());

        Guid? cidadeId = null;
        Guid? estadoId = null;

        if (estado is not null)
        {
            estadoId = estado.Id;

            var cidade = await _context.Cidades
                .AsNoTracking()
                .FirstOrDefaultAsync(c =>
                    c.EstadoId == estado.Id &&
                    c.Nome.ToUpper() == viaCep.Localidade.ToUpper());

            cidadeId = cidade?.Id;
        }

        return new CepResultado
        {
            Logradouro = viaCep.Logradouro,
            Bairro = viaCep.Bairro,
            CidadeNome = viaCep.Localidade,
            Uf = viaCep.Uf,
            CidadeId = cidadeId,
            EstadoId = estadoId
        };
    }

    private sealed class ViaCepResponse
    {
        public string Logradouro { get; init; } = string.Empty;
        public string Bairro { get; init; } = string.Empty;
        public string Localidade { get; init; } = string.Empty;
        public string Uf { get; init; } = string.Empty;

        [JsonPropertyName("erro")]
        public bool Erro { get; init; }
    }
}

public class CepResultado
{
    public string Logradouro { get; init; } = string.Empty;
    public string Bairro { get; init; } = string.Empty;
    public string CidadeNome { get; init; } = string.Empty;
    public string Uf { get; init; } = string.Empty;
    public Guid? CidadeId { get; init; }
    public Guid? EstadoId { get; init; }
}
