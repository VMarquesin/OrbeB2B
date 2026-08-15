namespace OrbeB2B.Crm.Application.DTOs;

// --- Itens de listas auxiliares ---

public record TopProdutoItem(string ProdutoDescricao, int QtdVendida);

// --- Cards do Dashboard Principal ---

public record DashboardCardsResponse(
    decimal ReceitaValidada,
    int ValidacaoPendenteQtd,
    int CarteiraAtivaQtd
);

// --- Gráfico receita própria vs terceiros ---

public record DashboardGraficoReceitaResponse(
    decimal ReceitaPropria,
    decimal ReceitaTerceiros
);

// --- Resposta completa do Dashboard Principal ---

public record DashboardPrincipalResponse(
    DashboardCardsResponse Cards,
    DashboardGraficoReceitaResponse GraficoReceita,
    IEnumerable<TopProdutoItem> TopVendidosProprios,
    IEnumerable<TopProdutoItem> TopVendidosTerceiros
);
