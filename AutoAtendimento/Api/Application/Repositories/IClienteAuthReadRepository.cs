using OrbeB2B.AutoAtendimento.Application.Models;

namespace OrbeB2B.AutoAtendimento.Application.Repositories;

public interface IClienteAuthReadRepository
{
    /// <summary>
    /// Busca o comprador pelo CNPJ do cliente vinculado.
    /// Fluxo: CNPJ → clientes → usuarios (WHERE usuarios.cliente_id = clientes.id)
    /// </summary>
    Task<CompradorAuthModel?> ObterCompradorPorCnpjAsync(string cnpj);
}
