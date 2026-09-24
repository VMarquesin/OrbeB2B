import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  DollarSign,
  Printer,
  TrendingUp,
  Calendar,
  FileText,
  CheckCircle2,
  X,
  Eye,
  Calculator
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Faturamento() {
  const [buscaCliente, setBuscaCliente] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);

  const [metricas, setMetricas] = useState({
    receitaTotal: 0,
    volumePedidos: 0,
    ticketMedio: 0
  });

  const [historico, setHistorico] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFaturamento = async () => {
    setIsLoading(true);

    try {
      const res = await api.get(
        '/api/inteligencia/faturamento?dataInicio=2000-01-01&dataFim=2100-12-31'
      );

      if (res.data) {
        setMetricas({
          receitaTotal:
            res.data.ReceitaPeriodo ||
            res.data.receitaPeriodo ||
            0,

          volumePedidos:
            res.data.VolumeOrcamentos ||
            res.data.volumeOrcamentos ||
            0,

          ticketMedio:
            res.data.TicketMedio ||
            res.data.ticketMedio ||
            0
        });

        const listaPedidosRaw = Array.isArray(
          res.data.HistoricoPedidos ||
            res.data.historicoPedidos
        )
          ? (
              res.data.HistoricoPedidos ||
              res.data.historicoPedidos
            )
          : [];

        console.log(
          'PEDIDO BRUTO DA API:',
          listaPedidosRaw[0]
        );

        const listaMapeada = listaPedidosRaw.map((p) => ({
          id:
            p.Id ||
            p.id ||
            Math.random().toString(),

          data_criacao:
            p.Data ||
            p.data,

          codigo_pedido_formatado:
            p.Codigo ||
            p.codigo,

          clienteNome:
            p.ClienteNome ||
            p.clienteNome,

          valor_total_pedido:
            p.ValorFechado ||
            p.valorFechado ||
            0,

          statusErp:
            p.StatusErp ||
            p.statusErp,

          status: 'concluido'
        }));

        setHistorico(listaMapeada);
      }
    } catch (error) {
      console.error(
        'Erro ao carregar faturamento:',
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaturamento();
  }, []);

  const orcamentosFiltrados = useMemo(() => {
    return historico.filter((orcamento) => {
      const termo = (
        buscaCliente || ''
      ).toLowerCase();

      const cliente = (
        orcamento.clienteNome || ''
      ).toLowerCase();

      const codigo = (
        orcamento.codigo_pedido_formatado || ''
      ).toLowerCase();

      const bateCliente =
        cliente.includes(termo) ||
        codigo.includes(termo);

      const dataOrigem =
        orcamento.data_criacao;

      const mesOrcamento = dataOrigem
        ? new Date(dataOrigem)
            .getMonth()
            .toString()
        : '';

      const bateMes =
        filtroMes === 'todos' ||
        mesOrcamento === filtroMes;

      return (
        bateCliente &&
        bateMes
      );
    });
  }, [
    buscaCliente,
    filtroMes,
    historico
  ]);

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set();

    historico.forEach((orc) => {
      if (orc.data_criacao) {
        meses.add(
          new Date(
            orc.data_criacao
          ).getMonth()
        );
      }
    });

    const nomesMeses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro'
    ];

    return Array.from(meses)
      .sort((a, b) => b - a)
      .map((num) => ({
        valor: num.toString(),
        label: nomesMeses[num]
      }));
  }, [historico]);

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">

      {/* ====================================================== */}
      {/* ESTILOS DE IMPRESSÃO */}
      {/* ====================================================== */}

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            html,
            body {
              width: 100%;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              overflow: visible !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body * {
              visibility: hidden;
            }

            #documento-orcamento,
            #documento-orcamento * {
              visibility: visible;
            }

            #documento-orcamento {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: white !important;
              color: #0f172a !important;
            }

            #documento-orcamento table {
              width: 100% !important;
              border-collapse: collapse !important;
            }

            #documento-orcamento thead {
              display: table-header-group;
            }

            #documento-orcamento tfoot {
              display: table-footer-group;
            }

            #documento-orcamento tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            #documento-orcamento h1,
            #documento-orcamento h2,
            #documento-orcamento h3,
            #documento-orcamento .secao-documento {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            #documento-orcamento .quebra-pagina {
              break-before: page;
              page-break-before: always;
            }

            #documento-orcamento .nao-quebrar {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            #documento-orcamento .print-shadow-none {
              box-shadow: none !important;
            }

            #documento-orcamento .print-border {
              border-color: #cbd5e1 !important;
            }

            #documento-orcamento .print-text-sm {
              font-size: 11px !important;
            }

            #documento-orcamento .print-text-xs {
              font-size: 9px !important;
            }
          }
        `}
      </style>

      {/* ====================================================== */}
      {/* CABEÇALHO DA TELA */}
      {/* ====================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Histórico de Faturamento
        </h1>

        <p className="text-slate-500 mt-1">
          Análise de LTV (Lifetime Value), espelhos de
          orçamentos e faturamento validado.
        </p>
      </div>

      {/* ====================================================== */}
      {/* CARDS FINANCEIROS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">
              Receita do Período
            </p>

            <h3 className="text-3xl font-black text-emerald-700">
              {formatCurrency(
                metricas.receitaTotal
              )}
            </h3>
          </div>

          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Volume de Orçamentos
            </p>

            <h3 className="text-3xl font-black text-slate-800">
              {metricas.volumePedidos}
            </h3>
          </div>

          <div className="bg-slate-50 text-slate-600 p-3 rounded-xl">
            <FileText size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">
              Ticket Médio
            </p>

            <h3 className="text-3xl font-black text-blue-700">
              {formatCurrency(
                metricas.ticketMedio
              )}
            </h3>
          </div>

          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <Calculator size={28} />
          </div>
        </div>

      </div>

      {/* ====================================================== */}
      {/* FILTROS */}
      {/* ====================================================== */}

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">

        <div className="flex-1 relative w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Buscar histórico por nome do cliente ou código do orçamento..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            value={buscaCliente}
            onChange={(e) =>
              setBuscaCliente(
                e.target.value
              )
            }
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">

          <Calendar
            className="text-slate-400"
            size={18}
          />

          <select
            className="bg-slate-50 border-none rounded-xl py-2.5 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 w-full md:w-48 cursor-pointer"
            value={filtroMes}
            onChange={(e) =>
              setFiltroMes(
                e.target.value
              )
            }
          >
            <option value="todos">
              Todos os Períodos
            </option>

            {mesesDisponiveis.map(
              (mes) => (
                <option
                  key={mes.valor}
                  value={mes.valor}
                >
                  {mes.label}
                </option>
              )
            )}
          </select>

        </div>

      </div>

      {/* ====================================================== */}
      {/* ALERTA DE LTV */}
      {/* ====================================================== */}

      {buscaCliente &&
        orcamentosFiltrados.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">

            <TrendingUp
              className="text-blue-500"
              size={24}
            />

            <div>
              <p className="text-sm text-blue-800">
                O LTV (Lifetime Value)
                filtrado na tela para{' '}
                <strong>
                  {buscaCliente}
                </strong>{' '}
                neste período é de{' '}
                <span className="font-black text-blue-900">
                  {formatCurrency(
                    metricas.receitaTotal
                  )}
                </span>{' '}
                divididos em{' '}
                {metricas.volumePedidos}{' '}
                compras.
              </p>
            </div>

          </div>
        )}

      {/* ====================================================== */}
      {/* TABELA PRINCIPAL */}
      {/* ====================================================== */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">

                <th className="px-6 py-4 font-bold">
                  Data
                </th>

                <th className="px-6 py-4 font-bold">
                  Código
                </th>

                <th className="px-6 py-4 font-bold">
                  Cliente
                </th>

                <th className="px-6 py-4 font-bold">
                  Valor Fechado
                </th>

                <th className="px-6 py-4 font-bold">
                  Status ERP
                </th>

                <th className="px-6 py-4 font-bold text-right">
                  Espelho
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {orcamentosFiltrados.length > 0 ? (
                orcamentosFiltrados.map(
                  (orcamento) => (
                    <tr
                      key={
                        orcamento.id
                      }
                      className="hover:bg-slate-50 transition-colors"
                    >

                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {orcamento.data_criacao
                          ? new Date(
                              orcamento.data_criacao
                            ).toLocaleDateString(
                              'pt-BR'
                            )
                          : '-'}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-400 text-sm">
                        {
                          orcamento.codigo_pedido_formatado
                        }
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-800">
                        {
                          orcamento.clienteNome
                        }
                      </td>

                      <td className="px-6 py-4 text-sm font-black text-emerald-600">
                        {formatCurrency(
                          orcamento.valor_total_pedido
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Aprovado
                        </span>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <button
                          onClick={async () => {
                            console.log(
                              'ID DO PEDIDO:',
                              orcamento.id
                            );

                            try {
                              const res =
                                await api.get(
                                  `/api/pedidos/${orcamento.id}`
                                );

                              console.log(
                                'DETALHE DO PEDIDO:',
                                res.data
                              );

                              setOrcamentoSelecionado(
                                {
                                  ...orcamento,
                                  ...res.data,
                                  itemsDetalhados:
                                    res.data.itens ||
                                    res.data.Itens ||
                                    []
                                }
                              );
                            } catch (
                              error
                            ) {
                              console.error(
                                'ERRO AO BUSCAR PEDIDO:',
                                error
                              );

                              setOrcamentoSelecionado(
                                orcamento
                              );
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 ml-auto"
                        >
                          <Eye size={14} />
                          Detalhes
                        </button>

                      </td>

                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-slate-400 font-medium"
                  >
                    Nenhum orçamento
                    encontrado para este
                    filtro.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ====================================================== */}
      {/* ESPELHO DO FATURAMENTO */}
      {/* ====================================================== */}

      {orcamentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:fixed print:inset-0 print:bg-white print:z-[99999] print:block">

          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:w-full print:h-auto print:border-none print:shadow-none print:rounded-none print:overflow-visible">

            {/* ================================================== */}
            {/* CABEÇALHO DO MODAL */}
            {/* ================================================== */}

            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">

              <div className="flex items-center gap-3">

                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                  <FileText size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Espelho do Faturamento
                  </h2>

                  <p className="text-xs text-slate-500">
                    Documento comercial do pedido
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setOrcamentoSelecionado(
                    null
                  )
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>

            </div>

            {/* ================================================== */}
            {/* DOCUMENTO */}
            {/* ================================================== */}

            <div
              id="documento-orcamento"
              className="p-8 space-y-5 overflow-y-auto print:p-0 print:overflow-visible"
            >

              {/* ================================================== */}
              {/* CABEÇALHO EMPRESA / PEDIDO */}
              {/* ================================================== */}

              <div className="secao-documento border-b-2 border-slate-800 pb-5">

                <div className="flex justify-between items-start gap-8">

                  <div className="flex-1">

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 mb-1">
                      Documento de faturamento
                    </p>

                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                      {orcamentoSelecionado.nomeFantasiaEmpresa ||
                        orcamentoSelecionado.razaoSocialEmpresa ||
                        'A CASEIRA'}
                    </h1>

                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      O verdadeiro sabor
                    </p>

                    <div className="mt-3 text-[11px] leading-5 text-slate-500">

                      {orcamentoSelecionado.razaoSocialEmpresa && (
                        <p className="font-bold text-slate-700">
                          {
                            orcamentoSelecionado.razaoSocialEmpresa
                          }
                        </p>
                      )}

                      <p>
                        {
                          orcamentoSelecionado.logradouroEmpresa
                        }

                        {orcamentoSelecionado.numeroEmpresa
                          ? `, Nº ${orcamentoSelecionado.numeroEmpresa}`
                          : ''}
                      </p>

                      <p>
                        {orcamentoSelecionado.cepEmpresa
                          ? `${orcamentoSelecionado.cepEmpresa} - `
                          : ''}

                        {
                          orcamentoSelecionado.cidadeEmpresa
                        }

                        {orcamentoSelecionado.ufEmpresa
                          ? `, ${orcamentoSelecionado.ufEmpresa}`
                          : ''}
                      </p>

                      {orcamentoSelecionado.cnpjEmpresa && (
                        <p>
                          CNPJ:{' '}
                          {
                            orcamentoSelecionado.cnpjEmpresa
                          }
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="shrink-0 text-right border border-slate-200 rounded-xl px-5 py-4 min-w-[190px]">

                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Pedido de Venda
                    </p>

                    <p className="font-mono font-black text-slate-900 text-2xl mt-1">
                      {orcamentoSelecionado.codigo_pedido_formatado ||
                        orcamentoSelecionado.codigoPedidoFormatado ||
                        '-'}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100">

                      <p className="text-xs text-slate-500">
                        {orcamentoSelecionado.data_criacao
                          ? new Date(
                              orcamentoSelecionado.data_criacao
                            ).toLocaleDateString(
                              'pt-BR'
                            )
                          : orcamentoSelecionado.dataCriacao
                          ? new Date(
                              orcamentoSelecionado.dataCriacao
                            ).toLocaleDateString(
                              'pt-BR'
                            )
                          : '-'}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {orcamentoSelecionado.data_criacao
                          ? new Date(
                              orcamentoSelecionado.data_criacao
                            ).toLocaleTimeString(
                              'pt-BR',
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )
                          : orcamentoSelecionado.dataCriacao
                          ? new Date(
                              orcamentoSelecionado.dataCriacao
                            ).toLocaleTimeString(
                              'pt-BR',
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )
                          : '-'}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* ================================================== */}
              {/* CLIENTE */}
              {/* ================================================== */}

              <div className="secao-documento border border-slate-200 rounded-xl overflow-hidden">

                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">

                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Dados do cliente
                  </p>

                </div>

                <div className="p-4 grid grid-cols-2 gap-8">

                  <div>

                    <p className="text-lg font-black text-slate-800">
                      {orcamentoSelecionado.nomeFantasiaCliente ||
                        orcamentoSelecionado.clienteNome ||
                        orcamentoSelecionado.nomeCliente ||
                        'Consumidor Final'}
                    </p>

                    {orcamentoSelecionado.nomeCliente &&
                      orcamentoSelecionado.nomeCliente !==
                        orcamentoSelecionado.nomeFantasiaCliente && (
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          {
                            orcamentoSelecionado.nomeCliente
                          }
                        </p>
                      )}

                    {orcamentoSelecionado.documentoCliente && (
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-bold">
                          CNPJ/CPF:
                        </span>{' '}
                        {
                          orcamentoSelecionado.documentoCliente
                        }
                      </p>
                    )}

                  </div>

                  <div className="text-right text-xs text-slate-500 leading-5">

                    {orcamentoSelecionado.logradouroCliente && (
                      <p>
                        {
                          orcamentoSelecionado.logradouroCliente
                        }

                        {orcamentoSelecionado.numeroCliente
                          ? `, Nº ${orcamentoSelecionado.numeroCliente}`
                          : ''}
                      </p>
                    )}

                    {orcamentoSelecionado.bairroCliente && (
                      <p>
                        Bairro:{' '}
                        {
                          orcamentoSelecionado.bairroCliente
                        }
                      </p>
                    )}

                    {(orcamentoSelecionado.cidadeCliente ||
                      orcamentoSelecionado.ufCliente) && (
                      <p>
                        {
                          orcamentoSelecionado.cidadeCliente
                        }

                        {orcamentoSelecionado.ufCliente
                          ? `, ${orcamentoSelecionado.ufCliente}`
                          : ''}
                      </p>
                    )}

                    {orcamentoSelecionado.cepCliente && (
                      <p>
                        CEP:{' '}
                        {
                          orcamentoSelecionado.cepCliente
                        }
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* ================================================== */}
              {/* RESUMO DO PEDIDO */}
              {/* ================================================== */}

              <div className="secao-documento grid grid-cols-3 gap-3">

                <div className="border border-slate-200 rounded-lg p-3">

                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Número do pedido
                  </p>

                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {orcamentoSelecionado.codigo_pedido_formatado ||
                      orcamentoSelecionado.codigoPedidoFormatado ||
                      '-'}
                  </p>

                </div>

                <div className="border border-slate-200 rounded-lg p-3">

                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Data
                  </p>

                  <p className="font-bold text-slate-800 text-sm mt-1">
                    {orcamentoSelecionado.data_criacao
                      ? new Date(
                          orcamentoSelecionado.data_criacao
                        ).toLocaleDateString(
                          'pt-BR'
                        )
                      : orcamentoSelecionado.dataCriacao
                      ? new Date(
                          orcamentoSelecionado.dataCriacao
                        ).toLocaleDateString(
                          'pt-BR'
                        )
                      : '-'}
                  </p>

                </div>

                <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-3">

                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600">
                    Status
                  </p>

                  <p className="font-bold text-emerald-700 text-sm mt-1 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Aprovado
                  </p>

                </div>

              </div>

              {/* ================================================== */}
              {/* PRODUTOS */}
              {/* ================================================== */}

              <div className="secao-documento">

                <div className="flex items-center justify-between mb-3">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">
                      Detalhamento
                    </p>

                    <h3 className="text-base font-black text-slate-800 mt-0.5">
                      Itens do Pedido
                    </h3>
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Valores em R$
                  </p>

                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">

                  <table className="w-full text-left border-collapse">

                    <thead>

                      <tr className="bg-slate-800 text-white text-[9px] uppercase tracking-wider">

                        <th className="p-2.5 font-bold">
                          Produto / Serviço
                        </th>

                        <th className="p-2.5 font-bold">
                          Código
                        </th>

                        <th className="p-2.5 font-bold text-center">
                          Un.
                        </th>

                        <th className="p-2.5 font-bold text-center">
                          Qtd.
                        </th>

                        <th className="p-2.5 font-bold text-right">
                          Valor unit.
                        </th>

                        <th className="p-2.5 font-bold text-right">
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {orcamentoSelecionado.itemsDetalhados &&
                      orcamentoSelecionado.itemsDetalhados.length > 0 ? (

                        orcamentoSelecionado.itemsDetalhados.map(
                          (
                            item,
                            index
                          ) => {

                            const nomeProduto =
                              item.nomeProduto ||
                              item.NomeProduto ||
                              'Produto';

                            const codigo =
                              item.codigoComercial ||
                              item.CodigoComercial ||
                              '-';

                            const embalagem =
                              item.embalagem ||
                              item.Embalagem ||
                              '-';

                            const quantidade =
                              item.quantidade ??
                              item.Quantidade ??
                              0;

                            const precoUnitario =
                              item.precoUnitario ??
                              item.PrecoUnitario ??
                              0;

                            const subtotal =
                              item.subtotal ??
                              item.Subtotal ??
                              quantidade *
                                precoUnitario;

                            return (
                              <tr
                                key={
                                  item.id ||
                                  item.Id ||
                                  index
                                }
                                className="text-[10px] text-slate-700 border-b border-slate-100 last:border-b-0"
                              >

                                <td className="p-2.5 font-semibold">
                                  {
                                    nomeProduto
                                  }
                                </td>

                                <td className="p-2.5 font-mono text-[9px] text-slate-500">
                                  {codigo}
                                </td>

                                <td className="p-2.5 text-center text-[9px] text-slate-500">
                                  {
                                    embalagem
                                  }
                                </td>

                                <td className="p-2.5 text-center font-black">
                                  {
                                    quantidade
                                  }
                                </td>

                                <td className="p-2.5 text-right whitespace-nowrap">
                                  {formatCurrency(
                                    precoUnitario
                                  )}
                                </td>

                                <td className="p-2.5 text-right font-bold text-slate-800 whitespace-nowrap">
                                  {formatCurrency(
                                    subtotal
                                  )}
                                </td>

                              </tr>
                            );
                          }
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan="6"
                            className="p-5 text-xs text-slate-400 italic text-center"
                          >
                            Detalhamento
                            indisponível para
                            este registro.
                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* ================================================== */}
              {/* RESUMO FINANCEIRO */}
              {/* ================================================== */}

              <div className="secao-documento border border-slate-200 rounded-xl overflow-hidden">

                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">

                  <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                    Resumo financeiro
                  </h3>

                </div>

                <div className="grid grid-cols-4">

                  <div className="p-3 border-r border-slate-200">

                    <p className="text-[9px] font-bold uppercase text-slate-400">
                      Nº de itens
                    </p>

                    <p className="text-lg font-black text-slate-800 mt-1">
                      {orcamentoSelecionado.quantidadeItens ??
                        orcamentoSelecionado.itemsDetalhados?.length ??
                        0}
                    </p>

                  </div>

                  <div className="p-3 border-r border-slate-200">

                    <p className="text-[9px] font-bold uppercase text-slate-400">
                      Soma das qtdes.
                    </p>

                    <p className="text-lg font-black text-slate-800 mt-1">
                      {orcamentoSelecionado.somaQuantidades ??
                        orcamentoSelecionado.itemsDetalhados?.reduce(
                          (
                            total,
                            item
                          ) =>
                            total +
                            Number(
                              item.quantidade ??
                                item.Quantidade ??
                                0
                            ),
                          0
                        ) ??
                        0}
                    </p>

                  </div>

                  <div className="p-3 border-r border-slate-200">

                    <p className="text-[9px] font-bold uppercase text-slate-400">
                      Total produtos
                    </p>

                    <p className="text-sm font-black text-slate-800 mt-2">
                      {formatCurrency(
                        orcamentoSelecionado.totalProdutos ??
                          orcamentoSelecionado.itemsDetalhados?.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              Number(
                                item.subtotal ??
                                  item.Subtotal ??
                                  Number(
                                    item.quantidade ??
                                      item.Quantidade ??
                                      0
                                  ) *
                                    Number(
                                      item.precoUnitario ??
                                        item.PrecoUnitario ??
                                        0
                                    )
                              ),
                            0
                          ) ??
                          0
                      )}
                    </p>

                  </div>

                  <div className="p-3 bg-emerald-50">

                    <p className="text-[9px] font-black uppercase text-emerald-600">
                      Total do pedido
                    </p>

                    <p className="text-xl font-black text-emerald-700 mt-1">
                      {formatCurrency(
                        orcamentoSelecionado.valor_total_pedido ??
                          orcamentoSelecionado.valorTotalPedido ??
                          0
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* ================================================== */}
              {/* OBSERVAÇÕES */}
              {/* ================================================== */}

              <div className="secao-documento border border-slate-200 rounded-xl overflow-hidden">

                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">

                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Observações
                  </p>

                </div>

                <div className="p-3">

                  <p className="text-xs text-slate-600 min-h-[20px]">
                    {orcamentoSelecionado.observacaoNegociacao ||
                      orcamentoSelecionado.ObservacaoNegociacao ||
                      'Nenhuma observação registrada.'}
                  </p>

                </div>

              </div>

              {/* ================================================== */}
              {/* RODAPÉ DO DOCUMENTO */}
              {/* ================================================== */}

              <div className="secao-documento border-t-2 border-slate-800 pt-4">

                <div className="flex justify-between items-end gap-8">

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Status no Sistema
                    </p>

                    <p className="text-xs font-black text-emerald-600 mt-1">
                      Aprovado e Integrado ao ERP
                    </p>

                    <p className="text-[9px] text-slate-400 mt-2">
                      Documento gerado pelo
                      sistema A Caseira.
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Total Final
                    </p>

                    <p className="text-2xl font-black text-slate-900 mt-1">
                      {formatCurrency(
                        orcamentoSelecionado.valor_total_pedido ??
                          orcamentoSelecionado.valorTotalPedido ??
                          0
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================== */}
            {/* BOTÕES */}
            {/* ================================================== */}

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0 print:hidden">

              <button
                onClick={() =>
                  setOrcamentoSelecionado(
                    null
                  )
                }
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
              >
                Fechar
              </button>

              <button
                onClick={() =>
                  window.print()
                }
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm"
              >
                <Printer size={18} />
                Baixar PDF / Imprimir
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}