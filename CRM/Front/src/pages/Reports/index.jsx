import { useState, useMemo } from 'react';
import { 
  Download, FileSpreadsheet, FileText, Filter, TrendingUp, 
  BarChart3, PieChart, Activity, Users, LayoutList, Briefcase, Store
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Reports() {
  // 2. A GAVETA VAZIA PARA OS DADOS DO BANCO
  const [pedidos, setPedidos] = useState([]);
  
  const [visaoAtiva, setVisaoAtiva] = useState('produtos'); 
  const [filtroMes, setFiltroMes] = useState('todos');
  const [filtroOrigem, setFiltroOrigem] = useState('todos');
  const [filtroSegmento, setFiltroSegmento] = useState('todos');

  // 3. BUSCA NO BACKEND
  useEffect(() => {
    async function carregarDadosRelatorios() {
      try {
        const resposta = await api.get('/api/pedidos');
        setPedidos(resposta.data);
      } catch (erro) {
        console.error("Erro ao carregar dados para os relatórios:", erro);
      }
    }

    carregarDadosRelatorios();
  }, []);

  // ==========================================
  // O MOTOR MATEMÁTICO DO BI (AGRUPAMENTO)
  // ==========================================
  const relatorioBI = useMemo(() => {
    let receitaTotal = 0;
    const rankingProdutos = {};
    const rankingClientes = {};

    const pedidosFiltrados = pedidos.filter(pedido => {
      if (pedido.status === 'aguardando_validacao' || pedido.status === 'pendente') return false;
      
      const dataOrigem = pedido.data_criacao;
      const mesPedido = dataOrigem ? new Date(dataOrigem).getMonth().toString() : '';
      const bateMes = filtroMes === 'todos' || mesPedido === filtroMes;

      const nomeLower = (pedido.clienteNome || '').toLowerCase();
      const isAtacado = nomeLower.includes('distribuidora') || nomeLower.includes('supermercado') || nomeLower.includes('atacado');
      const segmentoDestePedido = isAtacado ? 'Atacado' : 'Varejo';
      const bateSegmento = filtroSegmento === 'todos' || segmentoDestePedido === filtroSegmento;

      return bateMes && bateSegmento;
    });

    pedidosFiltrados.forEach(pedido => {
      const valorTotalPedido = pedido.valor_total_pedido || 0;
      const nomeDoCliente = pedido.clienteNome || 'Cliente Não Identificado';

      receitaTotal += valorTotalPedido;
      
      if (rankingClientes[nomeDoCliente]) {
        rankingClientes[nomeDoCliente].receita += valorTotalPedido;
        rankingClientes[nomeDoCliente].qtdPedidos += 1;
      } else {
        rankingClientes[nomeDoCliente] = {
          nome: nomeDoCliente,
          receita: valorTotalPedido,
          qtdPedidos: 1
        };
      }
      
      if (pedido.itemsDetalhados) {
        pedido.itemsDetalhados.forEach(item => {
          const bateOrigem = filtroOrigem === 'todos' || item.origem === filtroOrigem;
          if (bateOrigem) {
            const faturamentoItem = item.quantidade * (item.precoUnitario || 0);
            const nomeDoProduto = item.nome || 'Produto Não Identificado';

            if (rankingProdutos[nomeDoProduto]) {
              rankingProdutos[nomeDoProduto].receita += faturamentoItem;
              rankingProdutos[nomeDoProduto].qtd += item.quantidade;
            } else {
              rankingProdutos[nomeDoProduto] = { 
                nome: nomeDoProduto, receita: faturamentoItem, qtd: item.quantidade, origem: item.origem
              };
            }
          }
        });
      }
    });

    const produtosOrdenados = Object.values(rankingProdutos).sort((a, b) => b.receita - a.receita);
    let receitaAcumuladaProd = 0;
    const receitaTotalProd = produtosOrdenados.reduce((acc, p) => acc + p.receita, 0);

    const curvaABC = produtosOrdenados.map(produto => {
      receitaAcumuladaProd += produto.receita;
      const pctAcumulada = receitaTotalProd > 0 ? (receitaAcumuladaProd / receitaTotalProd) * 100 : 0;
      const pctIndividual = receitaTotalProd > 0 ? (produto.receita / receitaTotalProd) * 100 : 0;
      let classe = pctAcumulada <= 80 ? 'A' : pctAcumulada <= 95 ? 'B' : 'C';
      return { ...produto, classe, pctIndividual };
    });

    const clientesOrdenados = Object.values(rankingClientes).sort((a, b) => b.receita - a.receita);

    return {
      receitaTotal, curvaABC, clientesOrdenados,
      ticketMedio: pedidosFiltrados.length > 0 ? receitaTotal / pedidosFiltrados.length : 0
    };
  }, [pedidos, filtroMes, filtroOrigem, filtroSegmento]);

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set();

    pedidos.forEach(orc => {
      if (orc.data_criacao) {
        meses.add(new Date(orc.data_criacao).getMonth());
      }
    });
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return Array.from(meses).sort((a, b) => b - a).map(num => ({ valor: num.toString(), label: nomesMeses[num] }));
  }, [pedidos]);

  // ==========================================
  // FUNÇÃO DE EXPORTAÇÃO (FORMATADA PARA EXCEL BRASIL)
  // ==========================================
  const exportarPlanilha = () => {
    let csvContent = "";
    
    if (visaoAtiva === 'produtos') {
      // Uso do ponto-e-vírgula (;) e conversão de . para , nos decimais
      csvContent += "Classe;Produto;Quantidade Vendida;Faturamento (R$);Participacao (%)\n";
      relatorioBI.curvaABC.forEach(row => {
        const receitaStr = row.receita.toFixed(2).replace('.', ',');
        const pctStr = row.pctIndividual.toFixed(2).replace('.', ',');
        csvContent += `${row.classe};"${row.nome}";${row.qtd};"${receitaStr}";"${pctStr}"\n`;
      });
    } else {
      csvContent += "Cliente;Volume de Pedidos;Total Gasto (LTV - R$);Ticket Medio do Cliente (R$)\n";
      relatorioBI.clientesOrdenados.forEach(row => {
        const ticketLocal = row.qtdPedidos > 0 ? row.receita / row.qtdPedidos : 0;
        const receitaStr = row.receita.toFixed(2).replace('.', ',');
        const ticketStr = ticketLocal.toFixed(2).replace('.', ',');
        csvContent += `"${row.nome}";${row.qtdPedidos};"${receitaStr}";"${ticketStr}"\n`;
      });
    }

    // O \uFEFF é o BOM (Byte Order Mark). Ele obriga o Excel a abrir o arquivo em UTF-8, corrigindo os acentos.
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_${visaoAtiva}_caseira.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    // O pulo do gato na impressão: print:fixed print:inset-0 print:z-[99999] garante que esta div cubra tudo na hora de imprimir
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen print:p-8 print:bg-white print:fixed print:inset-0 print:z-[99999] print:w-full print:h-auto print:overflow-visible">
      
      {/* CABEÇALHO E AÇÕES GLOBAIS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white print:text-black">Inteligência de Mercado (BI)</h1>
          <p className="text-slate-500 mt-1 print:hidden">Análise estratégica, exportação de dados e inteligência de mercado.</p>
        </div>
        
        <div className="flex gap-2 print:hidden">
          <button 
            onClick={exportarPlanilha}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <FileSpreadsheet size={16} /> Exportar Excel (.CSV)
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm text-sm"
          >
            <FileText size={16} /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center print:hidden">
        <div className="flex items-center gap-2 w-full md:w-auto font-bold text-slate-600">
          <Filter size={18} /> Filtros:
        </div>
        
        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 outline-none"
          value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}
        >
          <option value="todos">Todos os Meses</option>
          {mesesDisponiveis.map(mes => <option key={mes.valor} value={mes.valor}>{mes.label}</option>)}
        </select>

        <select 
          className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 outline-none"
          value={filtroSegmento} onChange={(e) => setFiltroSegmento(e.target.value)}
        >
          <option value="todos">Todos os Segmentos</option>
          <option value="Atacado">Apenas Atacado (B2B)</option>
          <option value="Varejo">Apenas Varejo (B2C)</option>
        </select>

        {visaoAtiva === 'produtos' && (
          <select 
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-700 outline-none"
            value={filtroOrigem} onChange={(e) => setFiltroOrigem(e.target.value)}
          >
            <option value="todos">Todas as Origens (Próprio/Terceiro)</option>
            <option value="proprio">Produção Própria</option>
            <option value="terceiro">Revenda</option>
          </select>
        )}
      </div>

      {/* KPIS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-4 print:mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between print:break-inside-avoid print:border-slate-300">
          <div className="space-y-1">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider print:text-slate-800">Volume Analisado (Faturamento)</p>
            <h3 className="text-3xl font-black text-slate-800 print:text-black">{formatCurrency(relatorioBI.receitaTotal)}</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-xl print:hidden"><BarChart3 size={32} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between print:break-inside-avoid print:border-slate-300">
          <div className="space-y-1">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider print:text-slate-800">Média Gasta (Ticket Médio Global)</p>
            <h3 className="text-3xl font-black text-slate-800 print:text-black">{formatCurrency(relatorioBI.ticketMedio)}</h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-4 rounded-xl print:hidden"><TrendingUp size={32} /></div>
        </div>
      </div>

      {/* ÁREA DE DADOS - COM TABS (VISÃO DE PRODUTO VS VISÃO DE CLIENTE) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col print:border-none print:shadow-none">
        
        {/* TABS NAVEGAÇÃO */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 print:hidden">
          <button 
            onClick={() => setVisaoAtiva('produtos')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${visaoAtiva === 'produtos' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <PieChart size={18} /> Curva ABC de Produtos
          </button>
          <button 
            onClick={() => setVisaoAtiva('clientes')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${visaoAtiva === 'clientes' ? 'bg-white text-emerald-600 border-t-2 border-emerald-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Users size={18} /> Ranking de LTV por Clientes
          </button>
        </div>
        
        {/* Título Visível apenas na Impressão */}
        <h2 className="hidden print:block text-xl font-bold text-slate-800 p-4 pb-0">
          {visaoAtiva === 'produtos' ? 'Relatório: Curva ABC de Produtos' : 'Relatório: Ranking de LTV por Clientes'}
        </h2>

        {/* TABELA DE PRODUTOS */}
        {visaoAtiva === 'produtos' && (
          <div className="overflow-x-auto print:block print:overflow-visible">
            <table className="w-full text-left border-collapse print:border print:border-slate-300">
              <thead>
                <tr className="bg-white print:bg-slate-100 border-b border-slate-200 text-slate-400 print:text-slate-800 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-black">Classificação Pareto</th>
                  <th className="px-6 py-4 font-black">Produto</th>
                  <th className="px-6 py-4 font-black text-center">Qtd Vendida</th>
                  <th className="px-6 py-4 font-bold text-right">Faturamento Total</th>
                  <th className="px-6 py-4 font-bold text-right">Participação (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relatorioBI.curvaABC.length > 0 ? (
                  relatorioBI.curvaABC.map((produto, index) => {
                    let badgeStyle = produto.classe === 'A' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 print:border-slate-400' : 
                                     produto.classe === 'B' ? 'bg-amber-100 text-amber-800 border-amber-300 print:border-slate-400' : 
                                     'bg-slate-100 text-slate-600 border-slate-300 print:border-slate-400';
                    return (
                      <tr key={index} className="hover:bg-slate-50 print:break-inside-avoid">
                        <td className="px-6 py-4"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border ${badgeStyle}`}>{produto.classe}</span></td>
                        <td className="px-6 py-4 font-bold text-slate-800">{produto.nome}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-600 print:text-black">{produto.qtd}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-700 print:text-black">{formatCurrency(produto.receita)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-sm text-slate-600 print:text-black">{produto.pctIndividual.toFixed(1)}%</span>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden print:hidden">
                              <div className={`h-full ${produto.classe === 'A' ? 'bg-emerald-500' : produto.classe === 'B' ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${produto.pctIndividual}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium"><Activity className="inline mr-2"/> Nenhum dado para estes filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TABELA DE CLIENTES (LTV) */}
        {visaoAtiva === 'clientes' && (
          <div className="overflow-x-auto print:block print:overflow-visible">
            <table className="w-full text-left border-collapse print:border print:border-slate-300">
              <thead>
                <tr className="bg-white print:bg-slate-100 border-b border-slate-200 text-slate-400 print:text-slate-800 text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 font-black">Posição</th>
                  <th className="px-6 py-4 font-black">Cliente</th>
                  <th className="px-6 py-4 font-black text-center">Volume de Pedidos</th>
                  <th className="px-6 py-4 font-bold text-right">Ticket Médio (Cliente)</th>
                  <th className="px-6 py-4 font-bold text-right">Total Investido (LTV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relatorioBI.clientesOrdenados.length > 0 ? (
                  relatorioBI.clientesOrdenados.map((cliente, index) => {
                    const ticketLocal = cliente.qtdPedidos > 0 ? cliente.receita / cliente.qtdPedidos : 0;
                    return (
                      <tr key={index} className="hover:bg-slate-50 print:break-inside-avoid">
                        <td className="px-6 py-4"><span className="text-slate-400 font-bold print:text-black">#{index + 1}</span></td>
                        <td className="px-6 py-4 font-bold text-slate-800">{cliente.nome}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-600 bg-slate-50/50 print:bg-transparent print:text-black">{cliente.qtdPedidos}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-500 print:text-black">{formatCurrency(ticketLocal)}</td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600 print:text-black">{formatCurrency(cliente.receita)}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium"><Activity className="inline mr-2"/> Nenhum dado para estes filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}