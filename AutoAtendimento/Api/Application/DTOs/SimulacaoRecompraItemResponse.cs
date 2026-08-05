namespace OrbeB2B.AutoAtendimento.Application.DTOs;

public record SimulacaoRecompraItemResponse(
    Guid ProdutoId,
    string CodigoComercial,
    string Descricao,
    int QuantidadeHistorica,
    decimal PrecoAtual,
    bool EstaAtivo
);
