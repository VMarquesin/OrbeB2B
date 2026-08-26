import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Users, 
  CircleDollarSign, AlertCircle, Factory, Store, 
  ArrowRight, BarChart3, Loader2
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Dashboard() {
  const navigate = useNavigate();

  // =========================================================================
  // CONFIGURAÇÕES DE FÁBRICA (PCP — sincronizado com Configurações)
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
        mesasFisicas:     Number(config.mesasFisicas     || config.mesas           || 8),
        bandejasPorMesa:  Number(config.bandejasPorMesa  || config.bandejas         || 2),
        capacidadeBandeja:Number(config.capacidadeBandeja|| config.docesPorBandeja  || 208)
      });
    }
  }, []);

  const capacidadePorMesa    = configPcp.bandejasPorMesa * configPcp.capacidadeBandeja;
  const capacidadeTotalTurno = configPcp.mesasFisicas * capacidadePorMesa;

  // =========================================================================
  // ESTADO DO DASHBOARD (API REAL)
  // =========================================================================
  const [loading, setLoading] = useState(true);
  const [dash, setDash] = useState({
    receitaValidada:     0,
    validacaoPendente:   0,
    carteiraAtiva:       0,
    riscoEvasao:         0,
    receitaPropria:      0,
    receitaTerceiros:    0,
    pctPropria:          0,
    pctTerceiros:        0,
    topProprios:         [], // [{ produtoDescricao, qtdVendida }]
    topTerceiros:        []  // [{ produtoDescricao, qtdVendida }]
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/inteligencia/dashboard');
        const data = res.data;

        // Normaliza snake_case e PascalCase vindos da API
        const cards   = data.cards   || data.Cards   || {};
        const grafico = data.graficoReceita || data.GraficoReceita || {};
        const proprios  = data.topVendidosProprios  || data.TopVendidosProprios  || [];
        const terceiros = data.topVendidosTerceiros || data.TopVendidosTerceiros || [];

        const receitaPropria   = Number(grafico.receitaPropria   || grafico.ReceitaPropria   || 0);
        const receitaTerceiros = Number(grafico.receitaTerceiros || grafico.ReceitaTerceiros || 0);
        const totalGrafico     = receitaPropria + receitaTerceiros || 1; // evita divisão por zero

        setDash({
          receitaValidada:   Number(cards.receitaValidada   || cards.ReceitaValidada   || 0),
          validacaoPendente: Number(cards.validacaoPendenteQtd || cards.ValidacaoPendenteQtd || 0),
          carteiraAtiva:     Number(cards.carteiraAtivaQtd  || cards.CarteiraAtivaQtd  || 0),
          riscoEvasao:       Number(cards.riscoEvasaoQtd    || cards.RiscoEvasaoQtd    || 0),
          receitaPropria,
          receitaTerceiros,
          pctPropria:   +((receitaPropria   / totalGrafico) * 100).toFixed(1),
          pctTerceiros: +((receitaTerceiros / totalGrafico) * 100).toFixed(1),
          topProprios:  proprios.map(p => ({
            nome:       p.produtoDescricao || p.ProdutoDescricao || '',
            quantidade: p.qtdVendida       || p.QtdVendida       || 0
          })),
          topTerceiros: terceiros.map(p => ({
            nome:       p.produtoDescricao || p.ProdutoDescricao || '',
            quantidade: p.qtdVendida       || p.QtdVendida       || 0
          }))
        });
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =========================================================================
  // PCP — A carga da fábrica vem da API de pedidos "Em Preparação"
  // =========================================================================
  const [unidadesPropriasFila, setUnidadesPropriasFila] = useState(0);

  useEffect(() => {
    api.get('/api/pedidos')
      .then(res => {
        const pedidos = res.data ?? [];
        let total = 0;
        pedidos.forEach(p => {
          // status 1 = Faturado / 2 = EmSeparacao (ambos são "Em Preparação" na UI)
          const status = p.statusLogisticaInt ?? p.status_logistica ?? p.statusLogistica ?? -1;
          if (status === 1 || status === 2) {
            total += Number(p.quantidadeTotalItens || 0);
          }
        });
        setUnidadesPropriasFila(total);
      })
      .catch(() => setUnidadesPropriasFila(0));
  }, []);

  const mesasEmUso    = unidadesPropriasFila > 0 ? (unidadesPropriasFila / capacidadePorMesa).toFixed(1) : 0;
  const ocupacaoTurno = Math.min(100, ((unidadesPropriasFila / (capacidadeTotalTurno || 1)) * 100)).toFixed(1);

  // =========================================================================
  // RENDER
  // =========================================================================
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
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
            <Loader2 size={18} className="animate-spin" /> Carregando KPIs...
          </div>
        )}
      </div>

      {/* CARD DE CARGA DA FÁBRICA (PCP) */}
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
                  {unidadesPropriasFila.toLocaleString('pt-BR')} <span className="text-base font-medium text-slate-400">unidades</span>
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
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {loading ? <Loader2 size={20} className="animate-spin text-slate-300" /> : formatCurrency(dash.receitaValidada)}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <CircleDollarSign size={22} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-amber-600">
            <span>Ver DRE &amp; Caixa</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 2: Validação Pendente */}
        <div 
          onClick={() => navigate('/pedidos')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validação Pendente</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {loading
                  ? <Loader2 size={20} className="animate-spin text-slate-300" />
                  : <>{dash.validacaoPendente} <span className="text-sm font-medium text-slate-500">orçamentos</span></>
                }
              </h3>
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
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {loading
                  ? <Loader2 size={20} className="animate-spin text-slate-300" />
                  : <>{dash.carteiraAtiva} <span className="text-sm font-medium text-emerald-600">clientes</span></>
                }
              </h3>
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
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {loading
                  ? <Loader2 size={20} className="animate-spin text-rose-200" />
                  : <>{dash.riscoEvasao} <span className="text-xs font-medium text-slate-400">sem pedido &gt;60 dias</span></>
                }
              </h3>
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

      {/* GRÁFICO DE BARRAS: FÁBRICA VS TERCEIROS */}
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
              <span className="text-emerald-700">{formatCurrency(dash.receitaPropria)} ({dash.pctPropria}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden p-0.5">
              <div className="bg-emerald-500 h-full rounded-lg transition-all duration-1000" style={{ width: `${dash.pctPropria}%` }}></div>
            </div>
          </div>

          {/* Barra Terceiros */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-2"><Store size={14} className="text-purple-600" /> Produtos de Terceiros (Revenda)</span>
              <span className="text-purple-700">{formatCurrency(dash.receitaTerceiros)} ({dash.pctTerceiros}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden p-0.5">
              <div className="bg-purple-500 h-full rounded-lg transition-all duration-1000" style={{ width: `${dash.pctTerceiros}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* RANKINGS TOP PRODUTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ranking: Próprios */}
        <div 
          onClick={() => navigate('/produtos')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Factory size={18} className="text-emerald-600" /> Mais Vendidos – Fábrica (Próprios)
              </h3>
              <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 flex items-center gap-1">
                Catálogo <ArrowRight size={12} />
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
              ) : dash.topProprios.length > 0 ? (
                dash.topProprios.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-700 text-sm truncate">{prod.nome}</span>
                    </div>
                    <span className="font-black text-slate-800 text-sm whitespace-nowrap">{prod.quantidade.toLocaleString('pt-BR')} un</span>
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

        {/* Ranking: Terceiros */}
        <div 
          onClick={() => navigate('/produtos')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Store size={18} className="text-purple-600" /> Mais Vendidos – Revenda (Terceiros)
              </h3>
              <span className="text-xs font-bold text-slate-400 group-hover:text-amber-600 flex items-center gap-1">
                Catálogo <ArrowRight size={12} />
              </span>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
              ) : dash.topTerceiros.length > 0 ? (
                dash.topTerceiros.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-700 text-sm truncate">{prod.nome}</span>
                    </div>
                    <span className="font-black text-slate-800 text-sm whitespace-nowrap">{prod.quantidade.toLocaleString('pt-BR')} un</span>
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