import { useState, useMemo } from 'react';
import { 
  Search, Filter, DollarSign, Download, Printer, TrendingUp, 
  Calendar, FileText, CheckCircle2, X, Eye, Calculator
} from 'lucide-react';
import { mockOrders } from '../../services/mockData';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Faturamento() {
  const [buscaCliente, setBuscaCliente] = useState('');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);

  // Filtra apenas os orçamentos que JÁ FORAM VALIDADOS (saíram da fila de pendentes)
  const orcamentosValidados = useMemo(() => {
    return mockOrders.filter(pedido => pedido.status !== 'aguardando_validacao' && pedido.status !== 'pendente');
  }, []);

  // Lógica de Filtros (Cliente e Mês) - BLINDADA CONTRA TELA BRANCA
  const orcamentosFiltrados = useMemo(() => {
    return orcamentosValidados.filter(orcamento => {
      const termo = (buscaCliente || '').toLowerCase();
      const cliente = (orcamento.clienteNome || '').toLowerCase();
      const codigo = (orcamento.codigo_pedido_formatado || '').toLowerCase();
      
      const bateCliente = cliente.includes(termo) || codigo.includes(termo);
      
      const dataOrigem = orcamento.data_criacao;
      const mesOrcamento = dataOrigem ? new Date(dataOrigem).getMonth().toString() : ''; // 0 a 11
      const bateMes = filtroMes === 'todos' || mesOrcamento === filtroMes;

      return bateCliente && bateMes;
    });
  }, [buscaCliente, filtroMes, orcamentosValidados]);

  // Cálculo de KPIs Matemáticos e Financeiros
  const metricas = useMemo(() => {
    let receitaTotal = 0;
    
    orcamentosFiltrados.forEach(orc => receitaTotal += (orc.valor_total_pedido || 0));
    
    const volumePedidos = orcamentosFiltrados.length;
    // Cálculo do Ticket Médio (Razão entre Faturamento e Volume)
    const ticketMedio = volumePedidos > 0 ? receitaTotal / volumePedidos : 0;

    return { receitaTotal, volumePedidos, ticketMedio };
  }, [orcamentosFiltrados]);

  // Gera as opções de meses dinamicamente baseado nos dados existentes
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set();
    orcamentosValidados.forEach(orc => {
      if (orc.data_criacao) {
        meses.add(new Date(orc.data_criacao).getMonth());
      }
    });
    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return Array.from(meses).sort((a, b) => b - a).map(num => ({ valor: num.toString(), label: nomesMeses[num] }));
  }, [orcamentosValidados]);

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Histórico de Faturamento</h1>
        <p className="text-slate-500 mt-1">Análise de LTV (Lifetime Value), espelhos de orçamentos e faturamento validado.</p>
      </div>

      {/* Cards de Indicadores Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Receita do Período</p>
            <h3 className="text-3xl font-black text-emerald-700">{formatCurrency(metricas.receitaTotal)}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><DollarSign size={28} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Volume de Orçamentos</p>
            <h3 className="text-3xl font-black text-slate-800">{metricas.volumePedidos}</h3>
          </div>
          <div className="bg-slate-50 text-slate-600 p-3 rounded-xl"><FileText size={28} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">Ticket Médio</p>
            <h3 className="text-3xl font-black text-blue-700">{formatCurrency(metricas.ticketMedio)}</h3>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Calculator size={28} /></div>
        </div>
      </div>

      {/* Barra de Filtros de Pesquisa Analítica */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar histórico por nome do cliente ou código do orçamento..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            value={buscaCliente}
            onChange={(e) => setBuscaCliente(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="text-slate-400" size={18} />
          <select 
            className="bg-slate-50 border-none rounded-xl py-2.5 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 w-full md:w-48 cursor-pointer"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="todos">Todos os Períodos</option>
            {mesesDisponiveis.map(mes => (
              <option key={mes.valor} value={mes.valor}>{mes.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta de LTV quando o cliente é pesquisado */}
      {buscaCliente && orcamentosFiltrados.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={24} />
          <div>
            <p className="text-sm text-blue-800">
              O LTV (Lifetime Value) filtrado na tela para <strong>{buscaCliente}</strong> neste período é de <span className="font-black text-blue-900">{formatCurrency(metricas.receitaTotal)}</span> divididos em {metricas.volumePedidos} compras.
            </p>
          </div>
        </div>
      )}

      {/* Tabela de Orçamentos Faturados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Data</th>
                <th className="px-6 py-4 font-bold">Código</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Valor Fechado</th>
                <th className="px-6 py-4 font-bold">Status ERP</th>
                <th className="px-6 py-4 font-bold text-right">Espelho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orcamentosFiltrados.length > 0 ? (
                orcamentosFiltrados.map((orcamento) => (
                  <tr key={orcamento.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {orcamento.data_criacao ? new Date(orcamento.data_criacao).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400 text-sm">{orcamento.codigo_pedido_formatado}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{orcamento.clienteNome}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">
                      {formatCurrency(orcamento.valor_total_pedido)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12}/> Aprovado
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => setOrcamentoSelecionado(orcamento)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                      >
                        <Eye size={14} /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">
                    Nenhum orçamento encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL DE ESPELHO DO ORÇAMENTO (PARA PDF)   */}
      {/* ========================================== */}
      {orcamentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 print:hidden">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <FileText size={20} className="text-emerald-500" /> Espelho do Orçamento
              </h2>
              <button onClick={() => setOrcamentoSelecionado(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            {/* ÁREA DE IMPRESSÃO / CONTEÚDO DO DOCUMENTO */}
            <div className="p-8 space-y-6 overflow-y-auto print:p-0" id="documento-orcamento">
              
              {/* Cabeçalho do Documento */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">EMPRESA A CASEIRA</h1>
                  <p className="text-sm text-slate-500 mt-1">Documento Gerencial Interno - CRM</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800 text-lg">{orcamentoSelecionado.codigo_pedido_formatado}</p>
                  <p className="text-sm text-slate-500">
                    {orcamentoSelecionado.data_criacao ? new Date(orcamentoSelecionado.data_criacao).toLocaleDateString('pt-BR') : '-'} às {orcamentoSelecionado.data_criacao ? new Date(orcamentoSelecionado.data_criacao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '-'}
                  </p>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Faturado para</p>
                <p className="text-lg font-bold text-slate-800">{orcamentoSelecionado.clienteNome}</p>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-2">
                  Status no Sistema: <span className="text-emerald-600 font-bold uppercase tracking-wider text-xs">Aprovado e Integrado ao ERP</span>
                </p>
              </div>

              {/* Tabela de Itens Comprados */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Detalhamento dos Itens</h3>
                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                      <th className="p-3 font-bold">Produto</th>
                      <th className="p-3 font-bold text-center">Qtd</th>
                      <th className="p-3 font-bold text-right">V. Unitário</th>
                      <th className="p-3 font-bold text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orcamentoSelecionado.itemsDetalhados ? (
                      orcamentoSelecionado.itemsDetalhados.map((item, index) => (
                        <tr key={index} className="text-sm text-slate-700">
                          <td className="p-3 font-semibold">{item.nome}</td>
                          <td className="p-3 text-center font-black bg-slate-50">{item.quantidade}</td>
                          <td className="p-3 text-right">{formatCurrency(item.precoUnitario)}</td>
                          <td className="p-3 text-right font-bold text-slate-800">
                            {formatCurrency(item.quantidade * item.precoUnitario)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-4 text-xs text-slate-400 italic text-center">Detalhamento indisponível para este registro.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totais */}
              <div className="flex justify-end pt-6">
                <div className="w-1/2 bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                  <div className="flex justify-between items-center text-emerald-900">
                    <span className="font-bold uppercase text-xs tracking-wider">Total Final</span>
                    <span className="text-2xl font-black tracking-tight">{formatCurrency(orcamentoSelecionado.valor_total_pedido)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Botões de Ação Inferiores (Ocultos na Impressão) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0 print:hidden">
              <button 
                onClick={() => setOrcamentoSelecionado(null)} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
              >
                Fechar
              </button>
              
              <button 
                onClick={() => window.print()} 
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm"
              >
                <Download size={18} /> Baixar PDF / Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}