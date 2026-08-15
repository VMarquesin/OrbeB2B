import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, 
  CircleDollarSign, AlertCircle, Factory, Store, 
  ArrowRight, BarChart3
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Dashboard() {
  const navigate = useNavigate();
  // =========================================================================
  // 0. ESTADOS PARA OS DADOS DO BANCO REAL
  // =========================================================================
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        // Dispara as duas buscas ao mesmo tempo para a tela carregar mais rápido (Promise.all)
        const [respostaPedidos, respostaClientes] = await Promise.all([
          api.get('/api/pedidos'),
          api.get('/api/clientes')
        ]);
        
        setPedidos(respostaPedidos.data);
        setClientes(respostaClientes.data);
      } catch (erro) {
        console.error("Erro ao carregar dados do Dashboard:", erro);
      }
    }

    carregarDadosDashboard();
  }, []);

  // =========================================================================
  // 1. CONFIGURAÇÕES DE FÁBRICA (Sincronizado com a tela de Configurações)
  // =========================================================================
  const [configPcp, setConfigPcp] = useState({
    mesasFisicas: 8,
    bandejasPorMesa: 2,
    capacidadeBandeja: 208
  });

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('caseira_pcp_settings');
    if (dadosSalvos) {
      const config = JSON.parse(dadosSalvos);
      setConfigPcp({
        mesasFisicas: Number(config.mesasFisicas || config.mesas || 8),
        bandejasPorMesa: Number(config.bandejasPorMesa || config.bandejas || 2),
        capacidadeBandeja: Number(config.capacidadeBandeja || config.docesPorBandeja || 208)
      });
    }
  }, []);

  // Cálculos de Capacidade Física
  const capacidadePorMesa = configPcp.bandejasPorMesa * configPcp.capacidadeBandeja;
  const capacidadeTotalTurno = configPcp.mesasFisicas * capacidadePorMesa;

  // =========================================================================
  // 2. MOTOR DE CÁLCULO DE DADOS (LENDO O MOCK DINAMICAMENTE)
  // =========================================================================
  const metricas = useMemo(() => {
    let receitaValidada = 0;
    let faturamentoProprio = 0;
    let faturamentoTerceiro = 0;
    let unidadesPropriasFila = 0;
    
    const rankingProprios = {};
    const rankingTerceiros = {};

    pedidos.forEach(pedido => {
      // A. Carga Fabril (PCP) - Conta apenas o que está na fila de produção e é próprio
      if (pedido.status === 'preparando' || pedido.status === 'aguardando_validacao') {
        if (pedido.itemsDetalhados) {
          pedido.itemsDetalhados.forEach(item => {
            if (item.eh_fabricacao_propria || item.origem === 'proprio') {
              unidadesPropriasFila += item.quantidade;
            }
          });
        }
      }

      // B. Financeiro e Rankings - Conta apenas orçamentos Aprovados/Concluídos
      if (pedido.status !== 'aguardando_validacao' && pedido.status !== 'pendente') {
        receitaValidada += (pedido.valor_total_pedido || 0);

        if (pedido.itemsDetalhados) {
          pedido.itemsDetalhados.forEach(item => {
            const valorItem = item.quantidade * (item.precoUnitario || 0);
            
            if (item.eh_fabricacao_propria || item.origem === 'proprio') {
              faturamentoProprio += valorItem;
              // Soma para o Ranking de Próprios
              if (rankingProprios[item.nome]) rankingProprios[item.nome] += item.quantidade;
              else rankingProprios[item.nome] = item.quantidade;
            } else {
              faturamentoTerceiro += valorItem;
              // Soma para o Ranking de Terceiros
              if (rankingTerceiros[item.nome]) rankingTerceiros[item.nome] += item.quantidade;
              else rankingTerceiros[item.nome] = item.quantidade;
            }
          });
        }
      }
    });

    // C. Processamento dos Gráficos e Porcentagens
    const faturamentoTotal = (faturamentoProprio + faturamentoTerceiro) || 1; // Evita divisão por zero
    const pctProprio = ((faturamentoProprio / faturamentoTotal) * 100).toFixed(1);
    const pctTerceiro = ((faturamentoTerceiro / faturamentoTotal) * 100).toFixed(1);

    // D. Processamento dos Rankings (Top 3 Próprios, Top 3 Terceiros)
    const topProprios = Object.keys(rankingProprios)
      .map(nome => ({ nome, quantidade: rankingProprios[nome] }))
      .sort((a, b) => b.quantidade - a.quantidade).slice(0, 3);
      
    const topTerceiros = Object.keys(rankingTerceiros)
      .map(nome => ({ nome, quantidade: rankingTerceiros[nome] }))
      .sort((a, b) => b.quantidade - a.quantidade).slice(0, 3);

    return {
      receitaValidada,
      faturamentoProprio, faturamentoTerceiro, pctProprio, pctTerceiro,
      unidadesPropriasFila, topProprios, topTerceiros
    };
  }, [pedidos]);

  // =========================================================================
  // 3. INDICADORES ISOLADOS (CRM e Validação)
  // =========================================================================
  const mesasEmUso = metricas.unidadesPropriasFila > 0 ? (metricas.unidadesPropriasFila / capacidadePorMesa).toFixed(1) : 0;
  const ocupacaoTurno = Math.min(100, ((metricas.unidadesPropriasFila / capacidadeTotalTurno) * 100)).toFixed(1);
  
  const pedidosLandingPage = pedidos.filter(o => o.status === 'aguardando_validacao' || o.status_logistica === 'aguardando_validacao');
  const carteiraAtiva = clientes.filter(c => c.status_cadastro === 'ATIVO').length;
  const riscoEvasao = clientes.filter(c => c.status_cadastro === 'EM_RISCO').length;

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <LayoutDashboard className="text-amber-500" /> Painel de Controle Executivo
          </h1>
          <p className="text-slate-500 mt-1">Visão integrada de capacidade fabril, faturamento e esteira de orçamentos.</p>
        </div>
      </div>

      {/* CARD DE CARGA DA FÁBRICA DINÂMICO (PCP Sincronizado) */}
      <div 
        onClick={() => navigate('/pedidos')}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-105 transition-transform">
              <Factory size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Carga de Produção Interna (PCP)</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Sincronizado</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <h2 className="text-3xl font-black text-slate-800">
                  {metricas.unidadesPropriasFila.toLocaleString('pt-BR')} <span className="text-base font-medium text-slate-400">unidades</span>
                </h2>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {mesasEmUso} de {configPcp.mesasFisicas} mesas em uso
                </span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
              <span>Ocupação do Turno ({capacidadeTotalTurno.toLocaleString('pt-BR')} un max)</span>
              <span className="text-emerald-600">{ocupacaoTurno}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${ocupacaoTurno > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${ocupacaoTurno}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 text-right flex items-center justify-end gap-1 group-hover:text-amber-600 transition-colors">
              Ver fila de produção <ArrowRight size={12} />
            </p>
          </div>
        </div>
      </div>

      {/* GRID DE CARDS EXECUTIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Receita Validada */}
        <div 
          onClick={() => navigate('/financeiro')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receita Validada</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(metricas.receitaValidada)}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <CircleDollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-amber-600">
            <span>Ver DRE & Caixa</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 2: Orçamentos / Landing Page */}
        <div 
          onClick={() => navigate('/pedidos')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          {pedidosLandingPage.length > 0 && (
            <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm animate-pulse">
              NOVO VIA LANDING PAGE
            </span>
          )}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validação Pendente</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{pedidosLandingPage.length} <span className="text-sm font-medium text-slate-500">orçamentos</span></h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingCart size={22} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-amber-600">
            <span>Validar na Esteira</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3: Carteira Ativa */}
        <div 
          onClick={() => navigate('/clientes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Carteira Ativa</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{carteiraAtiva} <span className="text-sm font-medium text-emerald-600 flex-inline items-center">clientes</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-amber-600">
            <span>Gerenciar CRM</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 4: Risco de Evasão */}
        <div 
          onClick={() => navigate('/clientes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Risco de Evasão</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{riscoEvasao} <span className="text-xs font-medium text-slate-400">em risco</span></h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertCircle size={22} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-rose-600">
            <span>Auditar Clientes</span>
            <ArrowRight size={14} />
          </div>
        </div>

      </div>

      {/* BLOCO: GRÁFICO DE BARRAS COMPARATIVO (FÁBRICA VS TERCEIROS) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-500" /> Retorno Financeiro por Origem (Fábrica vs Terceiros)
          </h3>
          <span className="text-xs font-bold text-slate-400">Análise de Receita Consolidada</span>
        </div>

        <div className="space-y-4 pt-2">
          {/* Barra Própria */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-2"><Factory size={14} className="text-emerald-600" /> Produtos Próprios (Fábrica)</span>
              <span className="text-emerald-700">{formatCurrency(metricas.faturamentoProprio)} ({metricas.pctProprio}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden p-0.5">
              <div className="bg-emerald-500 h-full rounded-lg transition-all duration-1000" style={{ width: `${metricas.pctProprio}%` }}></div>
            </div>
          </div>

          {/* Barra Terceiros */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-2"><Store size={14} className="text-purple-600" /> Produtos de Terceiros (Revenda)</span>
              <span className="text-purple-700">{formatCurrency(metricas.faturamentoTerceiro)} ({metricas.pctTerceiro}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden p-0.5">
              <div className="bg-purple-500 h-full rounded-lg transition-all duration-1000" style={{ width: `${metricas.pctTerceiro}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: RANKINGS SEPARADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ranking 1: Próprios */}
        <div 
          onClick={() => navigate('/produtos')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Factory size={18} className="text-emerald-600" /> Mais Vendidos - Fábrica (Próprios)
              </h3>
              <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 flex items-center gap-1">
                Catálogo <ArrowRight size={12} />
              </span>
            </div>

            <div className="space-y-3">
              {metricas.topProprios.length > 0 ? (
                metricas.topProprios.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-700 text-sm truncate">{prod.nome}</span>
                    </div>
                    <span className="font-black text-slate-800 text-sm whitespace-nowrap">{prod.quantidade} un</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">Nenhum dado registrado ainda.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs font-bold text-slate-400 text-right group-hover:text-amber-600">
            Clique para gerenciar o estoque e preços
          </div>
        </div>

        {/* Ranking 2: Terceiros */}
        <div 
          onClick={() => navigate('/produtos')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Store size={18} className="text-purple-600" /> Mais Vendidos - Revenda (Terceiros)
              </h3>
              <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 flex items-center gap-1">
                Catálogo <ArrowRight size={12} />
              </span>
            </div>

            <div className="space-y-3">
              {metricas.topTerceiros.length > 0 ? (
                metricas.topTerceiros.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-700 text-sm truncate">{prod.nome}</span>
                    </div>
                    <span className="font-black text-slate-800 text-sm whitespace-nowrap">{prod.quantidade} un</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">Nenhum dado registrado ainda.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs font-bold text-slate-400 text-right group-hover:text-amber-600">
            Clique para gerenciar o estoque e preços
          </div>
        </div>

      </div>

    </div>
  );
}