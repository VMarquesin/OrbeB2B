import { useState, useMemo, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Reports() {
  const [visaoAtiva, setVisaoAtiva] = useState('produtos');
  const [filtroOrigem, setFiltroOrigem] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(true);

  // ==========================================
  // ESTADO — DADOS REAIS DO BACKEND
  // ==========================================
  const [faturamentoData, setFaturamentoData] = useState({
    receitaTotal: 0,
    ticketMedio: 0,
    historicoPedidos: []
  });

  const [curvaABC, setCurvaABC] = useState([]);

  useEffect(() => {
    const fetchRelatorio = async () => {
      setLoading(true);

      try {
        console.log('ENTROU NO FETCH DO RELATÓRIO');

        const [resFaturamento, resCurva] = await Promise.all([
          api.get(
            `/api/inteligencia/faturamento?dataInicio=${
              dataInicio || '2000-01-01'
            }&dataFim=${dataFim || '2100-12-31'}`
          ),

          api.get(
            `/api/inteligencia/curva-abc?dataInicio=${
              dataInicio || '2000-01-01'
            }&dataFim=${dataFim || '2100-12-31'}`
          )
        ]);

        // ==========================================
        // FATURAMENTO
        // ==========================================
        const fat = resFaturamento.data ?? {};

        setFaturamentoData({
          receitaTotal: Number(
            fat.receitaPeriodo ||
              fat.ReceitaPeriodo ||
              0
          ),

          ticketMedio: Number(
            fat.ticketMedio ||
              fat.TicketMedio ||
              0
          ),

          historicoPedidos:
            fat.historicoPedidos ||
            fat.HistoricoPedidos ||
            []
        });

        // ==========================================
        // CURVA ABC
        // ==========================================
        const curva = resCurva.data ?? {};

        const itens =
          curva.itensCurvaAbc ||
          curva.ItensCurvaAbc ||
          [];

        const curvaFormatada = itens.map(item => ({
          classe:
            item.classificacaoPareto ||
            item.ClassificacaoPareto ||
            '?',

          nome:
            item.produto ||
            item.Produto ||
            '',

          qtd:
            item.qtdVendida ||
            item.QtdVendida ||
            0,

          receita: Number(
            item.faturamentoTotal ||
              item.FaturamentoTotal ||
              0
          ),

          pctIndividual: Number(
            item.participacaoPercentual ||
              item.ParticipacaoPercentual ||
              0
          ),

          ehFabricacaoPropria:
            item.ehFabricacaoPropria ??
            item.EhFabricacaoPropria ??
            false
        }));

        setCurvaABC(curvaFormatada);
      } catch (err) {
        console.error(
          'Erro ao carregar BI:',
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, [dataInicio, dataFim]);

  // ==========================================
  // RANKING LTV POR CLIENTES
  // ==========================================
  const clientesOrdenados = useMemo(() => {
    const ranking = {};

    faturamentoData.historicoPedidos.forEach(
      pedido => {
        const nome =
          pedido.clienteNome ||
          pedido.ClienteNome ||
          'Cliente Não Identificado';

        const valor = Number(
          pedido.valorFechado ||
            pedido.ValorFechado ||
            0
        );

        if (ranking[nome]) {
          ranking[nome].receita += valor;
          ranking[nome].qtdPedidos += 1;
        } else {
          ranking[nome] = {
            nome,
            receita: valor,
            qtdPedidos: 1
          };
        }
      }
    );

    return Object.values(ranking).sort(
      (a, b) => b.receita - a.receita
    );
  }, [faturamentoData.historicoPedidos]);

  // ==========================================
  // FILTRO DE ORIGEM DA CURVA ABC
  // ==========================================
  const curvaFiltrada = useMemo(() => {
    let itens = curvaABC;

    if (filtroOrigem === 'proprio') {
      itens = curvaABC.filter(
        item =>
          item.ehFabricacaoPropria === true
      );
    }

    if (filtroOrigem === 'terceiro') {
      itens = curvaABC.filter(
        item =>
          item.ehFabricacaoPropria === false
      );
    }

    const faturamentoTotal = itens.reduce(
      (total, item) =>
        total + item.receita,
      0
    );

    let acumulado = 0;

    return itens.map(item => {
      acumulado += item.receita;

      const pctIndividual =
        faturamentoTotal > 0
          ? (item.receita / faturamentoTotal) *
            100
          : 0;

      const pctAcumulado =
        faturamentoTotal > 0
          ? (acumulado / faturamentoTotal) *
            100
          : 0;

      const classe =
        pctAcumulado <= 80
          ? 'A'
          : pctAcumulado <= 95
            ? 'B'
            : 'C';

      return {
        ...item,
        pctIndividual,
        classe
      };
    });
  }, [curvaABC, filtroOrigem]);

  // ==========================================
  // KPIs
  // ==========================================
  const kpisFiltrados = useMemo(() => {
    const receita = curvaFiltrada.reduce(
      (total, item) =>
        total + item.receita,
      0
    );

    const quantidadePedidos =
      faturamentoData.historicoPedidos.length;

    return {
      receita,

      ticketMedio:
        quantidadePedidos > 0
          ? receita / quantidadePedidos
          : 0
    };
  }, [
    curvaFiltrada,
    faturamentoData.historicoPedidos
  ]);

  // ==========================================
  // EXPORTAÇÃO CSV
  // ==========================================
  const exportarPlanilha = () => {
    let csvContent = '';

    if (visaoAtiva === 'produtos') {
      csvContent +=
        'Classe;Produto;Quantidade Vendida;Faturamento (R$);Participacao (%)\n';

      curvaFiltrada.forEach(row => {
        const receitaStr =
          row.receita
            .toFixed(2)
            .replace('.', ',');

        const pctStr =
          row.pctIndividual
            .toFixed(2)
            .replace('.', ',');

        csvContent +=
          `${row.classe};"${row.nome}";${row.qtd};"${receitaStr}";"${pctStr}"\n`;
      });
    } else {
      csvContent +=
        'Cliente;Volume de Pedidos;Total Gasto (LTV - R$);Ticket Medio do Cliente (R$)\n';

      clientesOrdenados.forEach(row => {
        const ticket =
          row.qtdPedidos > 0
            ? row.receita / row.qtdPedidos
            : 0;

        const receitaStr =
          row.receita
            .toFixed(2)
            .replace('.', ',');

        const ticketStr =
          ticket
            .toFixed(2)
            .replace('.', ',');

        csvContent +=
          `"${row.nome}";${row.qtdPedidos};"${receitaStr}";"${ticketStr}"\n`;
      });
    }

    const blob = new Blob(
      ['\uFEFF' + csvContent],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      url
    );

    link.setAttribute(
      'download',
      `relatorio_${visaoAtiva}_bi.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 10mm;
            }

            html,
            body,
            #root {
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              overflow: visible !important;
              position: static !important;
            }
              @media print {
  html,
  body,
  #root {
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    overflow: visible !important;
    position: static !important;
  }

  #root * {
    overflow: visible !important;
  }

  @page {
    size: landscape;
    margin: 10mm;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }

  table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
  }

  thead {
    display: table-header-group !important;
  }

  tbody {
    display: table-row-group !important;
  }

  tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  th,
  td {
    padding: 6px !important;
    font-size: 9px !important;
  }

  th:nth-child(1),
  td:nth-child(1) {
    width: 10%;
  }

  th:nth-child(2),
  td:nth-child(2) {
    width: 30%;
  }

  th:nth-child(3),
  td:nth-child(3) {
    width: 18%;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 22%;
  }

  th:nth-child(5),
  td:nth-child(5) {
    width: 20%;
  }

  .print\\:break-inside-avoid {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}

            body {
              margin: 0 !important;
              padding: 0 !important;
            }

            table {
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
            }

            thead {
              display: table-header-group !important;
            }

            tbody {
              display: table-row-group !important;
            }

            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            th,
            td {
              padding: 6px !important;
              font-size: 9px !important;
            }

            th:nth-child(1),
            td:nth-child(1) {
              width: 10%;
            }

            th:nth-child(2),
            td:nth-child(2) {
              width: 30%;
            }

            th:nth-child(3),
            td:nth-child(3) {
              width: 18%;
            }

            th:nth-child(4),
            td:nth-child(4) {
              width: 22%;
            }

            th:nth-child(5),
            td:nth-child(5) {
              width: 20%;
            }

            .print\\:break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}
      </style>

      <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen print:p-6 print:bg-white print:w-full print:min-h-0 print:h-auto print:overflow-visible">

        {/* CABEÇALHO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white print:text-black">
              Inteligência de Mercado (BI)
            </h1>

            <p className="hidden print:block text-sm text-slate-600">
              Período analisado:{' '}

              {dataInicio || dataFim
                ? `
                  ${
                    dataInicio
                      ? new Date(
                          `${dataInicio}T00:00:00`
                        ).toLocaleDateString(
                          'pt-BR'
                        )
                      : 'Início não informado'
                  }
                  até
                  ${
                    dataFim
                      ? new Date(
                          `${dataFim}T00:00:00`
                        ).toLocaleDateString(
                          'pt-BR'
                        )
                      : 'Fim não informado'
                  }
                `
                : 'Todo o período'}
            </p>

            <p className="text-slate-500 mt-1 print:hidden">
              Análise estratégica, exportação de
              dados e inteligência de mercado.
            </p>
          </div>

          <div className="flex gap-2 print:hidden">
            <button
              onClick={exportarPlanilha}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm text-sm cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              Exportar Excel (.CSV)
            </button>

            <button
              onClick={() => window.print()}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm text-sm cursor-pointer"
            >
              <FileText size={16} />
              Imprimir Relatório
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center print:hidden">
          <div className="flex items-center gap-2 w-full md:w-auto font-bold text-slate-600">
            <Filter size={18} />
            Filtros:
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Data inicial:
            </label>

            <input
              type="date"
              value={dataInicio}
              onChange={e =>
                setDataInicio(e.target.value)
              }
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Data final:
            </label>

            <input
              type="date"
              value={dataFim}
              onChange={e =>
                setDataFim(e.target.value)
              }
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 outline-none"
            />
          </div>

          {visaoAtiva === 'produtos' && (
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 outline-none"
              value={filtroOrigem}
              onChange={e =>
                setFiltroOrigem(e.target.value)
              }
            >
              <option value="todos">
                Todas as Origens (Próprio/Terceiro)
              </option>

              <option value="proprio">
                Produção Própria
              </option>

              <option value="terceiro">
                Revenda
              </option>
            </select>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-4 print:mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between print:break-inside-avoid print:border-slate-300">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider print:text-slate-800">
                Volume Analisado (Faturamento)
              </p>

              <h3 className="text-3xl font-black text-slate-800 print:text-black">
                {loading ? (
                  <Loader2
                    size={24}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  formatCurrency(
                    kpisFiltrados.receita
                  )
                )}
              </h3>
            </div>

            <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl print:hidden">
              <BarChart3 size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between print:break-inside-avoid print:border-slate-300">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider print:text-slate-800">
                Média Gasta (Ticket Médio Global)
              </p>

              <h3 className="text-3xl font-black text-slate-800 print:text-black">
                {loading ? (
                  <Loader2
                    size={24}
                    className="animate-spin text-slate-300"
                  />
                ) : (
                  formatCurrency(
                    kpisFiltrados.ticketMedio
                  )
                )}
              </h3>
            </div>

            <div className="bg-amber-50 text-amber-600 p-4 rounded-xl print:hidden">
              <TrendingUp size={32} />
            </div>
          </div>
        </div>

        {/* ÁREA DE DADOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible flex flex-col print:border-none print:shadow-none print:overflow-visible">  

          {/* TABS */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 print:hidden">
            <button
              onClick={() =>
                setVisaoAtiva('produtos')
              }
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                visaoAtiva === 'produtos'
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-600'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <PieChart size={18} />
              Curva ABC de Produtos
            </button>

            <button
              onClick={() =>
                setVisaoAtiva('clientes')
              }
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                visaoAtiva === 'clientes'
                  ? 'bg-white text-emerald-600 border-t-2 border-emerald-600'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Users size={18} />
              Ranking de LTV por Clientes
            </button>
          </div>

          {/* TÍTULO DE IMPRESSÃO */}
          <h2 className="hidden print:block text-xl font-bold text-slate-800 p-4 pb-0">
            {visaoAtiva === 'produtos'
              ? 'Relatório: Curva ABC de Produtos'
              : 'Relatório: Ranking de LTV por Clientes'}
          </h2>

          {/* TABELA CURVA ABC */}
          {visaoAtiva === 'produtos' && (
            <div className="overflow-x-auto print:block print:overflow-visible">
              <table className="w-full text-left border-collapse table-fixed print:border print:border-slate-300 print:w-full">
                <thead>
                  <tr className="bg-white print:bg-slate-100 border-b border-slate-200 text-slate-400 print:text-slate-800 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-black">
                      Classificação Pareto
                    </th>

                    <th className="px-6 py-4 font-black">
                      Produto
                    </th>

                    <th className="px-6 py-4 font-black text-center">
                      Qtd Vendida
                    </th>

                    <th className="px-6 py-4 font-bold text-right">
                      Faturamento Total
                    </th>

                    <th className="px-6 py-4 font-bold text-right">
                      Participação (%)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center"
                      >
                        <Loader2
                          size={28}
                          className="animate-spin text-slate-300 mx-auto"
                        />
                      </td>
                    </tr>
                  ) : curvaFiltrada.length > 0 ? (
                    curvaFiltrada.map(
                      (produto, index) => {
                        const badgeStyle =
                          produto.classe === 'A'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : produto.classe === 'B'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300';

                        return (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 print:break-inside-avoid"
                          >
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border ${badgeStyle}`}
                              >
                                {produto.classe}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-bold text-slate-800">
                              {produto.nome}
                            </td>

                            <td className="px-6 py-4 text-center font-semibold text-slate-600 print:text-black">
                              {produto.qtd.toLocaleString(
                                'pt-BR'
                              )}
                            </td>

                            <td className="px-6 py-4 text-right font-black text-slate-700 print:text-black">
                              {formatCurrency(
                                produto.receita
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-bold text-sm text-slate-600 print:text-black">
                                  {produto.pctIndividual.toFixed(
                                    1
                                  )}
                                  %
                                </span>

                                <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden print:hidden">
                                  <div
                                    className={`h-full ${
                                      produto.classe ===
                                      'A'
                                        ? 'bg-emerald-500'
                                        : produto.classe ===
                                            'B'
                                          ? 'bg-amber-500'
                                          : 'bg-slate-400'
                                    }`}
                                    style={{
                                      width: `${produto.pctIndividual}%`
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-slate-400 font-medium"
                      >
                        <Activity className="inline mr-2" />
                        Nenhum dado para estes filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TABELA RANKING LTV CLIENTES */}
          {visaoAtiva === 'clientes' && (
            <div className="overflow-x-auto print:block print:overflow-visible">
              <table className="w-full text-left border-collapse table-fixed print:border print:border-slate-300 print:w-full">
                <thead>
                  <tr className="bg-white print:bg-slate-100 border-b border-slate-200 text-slate-400 print:text-slate-800 text-[10px] uppercase tracking-widest">
                    <th className="px-6 py-4 font-black">
                      Posição
                    </th>

                    <th className="px-6 py-4 font-black">
                      Cliente
                    </th>

                    <th className="px-6 py-4 font-black text-center">
                      Volume de Pedidos
                    </th>

                    <th className="px-6 py-4 font-bold text-right">
                      Ticket Médio (Cliente)
                    </th>

                    <th className="px-6 py-4 font-bold text-right">
                      Total Investido (LTV)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center"
                      >
                        <Loader2
                          size={28}
                          className="animate-spin text-slate-300 mx-auto"
                        />
                      </td>
                    </tr>
                  ) : clientesOrdenados.length > 0 ? (
                    clientesOrdenados.map(
                      (cliente, index) => {
                        const ticketLocal =
                          cliente.qtdPedidos > 0
                            ? cliente.receita /
                              cliente.qtdPedidos
                            : 0;

                        return (
                          <tr
                            key={index}
                            className="hover:bg-slate-50 print:break-inside-avoid"
                          >
                            <td className="px-6 py-4">
                              <span className="text-slate-400 font-bold print:text-black">
                                #{index + 1}
                              </span>
                            </td>

                            <td className="px-6 py-4 font-bold text-slate-800">
                              {cliente.nome}
                            </td>

                            <td className="px-6 py-4 text-center font-semibold text-slate-600 bg-slate-50/50 print:bg-transparent print:text-black">
                              {cliente.qtdPedidos}
                            </td>

                            <td className="px-6 py-4 text-right font-medium text-slate-500 print:text-black">
                              {formatCurrency(
                                ticketLocal
                              )}
                            </td>

                            <td className="px-6 py-4 text-right font-black text-emerald-600 print:text-black">
                              {formatCurrency(
                                cliente.receita
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-slate-400 font-medium"
                      >
                        <Activity className="inline mr-2" />
                        Nenhum dado para estes filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}