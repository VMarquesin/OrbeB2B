using OrbeB2B.AutoAtendimento.Application.DTOs;

namespace OrbeB2B.AutoAtendimento.Application.Repositories;

public interface IMeusPedidosReadRepository
{
    Task<IEnumerable<MeuPedidoResumoResponse>> ObterHistoricoAsync(Guid clienteId);
    Task<MeuPedidoDetalheResponse?> ObterDetalhesAsync(Guid pedidoId, Guid clienteId);
    Task<IEnumerable<SimulacaoRecompraItemResponse>> ObterSimulacaoRecompraAsync(Guid pedidoId, Guid clienteId);
}
