import { useState, useEffect, useMemo } from 'react';
import { Save, AlertTriangle, Settings2, Info, Factory, CheckCircle2, X } from 'lucide-react';

export default function Configuracoes() {
  // Estados para os parâmetros de fábrica
  const [mesas, setMesas] = useState(8);
  const [bandejas, setBandejas] = useState(2);
  const [docesPorBandeja, setDocesPorBandeja] = useState(208);
  
  // Estados de controle da interface (Modais e Alertas)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Carrega os dados salvos ao abrir a tela (simulando um GET no Banco de Dados)
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('caseira_pcp_settings');
    if (dadosSalvos) {
      const config = JSON.parse(dadosSalvos);
      setMesas(config.mesas);
      setBandejas(config.bandejas);
      setDocesPorBandeja(config.docesPorBandeja);
    }
  }, []);

  // Cálculo algébrico da capacidade em tempo real (C = B * D * M)
  const capacidadeTotalTurno = useMemo(() => {
    return mesas * bandejas * docesPorBandeja;
  }, [mesas, bandejas, docesPorBandeja]);

  // Função para salvar definitivamente os parâmetros
  const salvarConfiguracoes = () => {
    const config = { mesas, bandejas, docesPorBandeja, capacidadeTotalTurno };
    // Salva globalmente para o Termômetro ler depois (Simulando o POST)
    localStorage.setItem('caseira_pcp_settings', JSON.stringify(config));
    
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000); // Oculta o aviso de sucesso após 3s
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen relative">
      
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          <Settings2 className="text-slate-500" /> Configurações do Sistema
        </h1>
        <p className="text-slate-500 mt-1">Gerenciamento de parâmetros da fábrica e arquitetura do sistema.</p>
      </div>

      {/* Alerta de Sucesso Flutuante */}
      {showSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm font-bold animate-pulse">
          <CheckCircle2 size={20} /> Parâmetros de produção atualizados com sucesso!
        </div>
      )}

      {/* Bloco de Configuração do PCP */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Factory size={24} className="text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">PCP — Parâmetros de Fábrica</h2>
            <p className="text-sm text-slate-500">Defina os limites físicos de produção para o cálculo automático de lotes.</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input: Mesas Físicas */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mesas Físicas (Qtd)</label>
              <input 
                type="number" 
                min="1"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-black text-lg text-slate-800 outline-none"
                value={mesas}
                onChange={(e) => setMesas(Number(e.target.value))}
              />
            </div>

            {/* Input: Bandejas por Mesa */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bandejas por Mesa</label>
              <input 
                type="number" 
                min="1"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-black text-lg text-slate-800 outline-none"
                value={bandejas}
                onChange={(e) => setBandejas(Number(e.target.value))}
              />
            </div>

            {/* Input: Doces por Bandeja */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Capacidade da Bandeja (Doces)</label>
              <input 
                type="number" 
                min="1"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-black text-lg text-slate-800 outline-none"
                value={docesPorBandeja}
                onChange={(e) => setDocesPorBandeja(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Microcopy Educativo */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
            <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-bold text-amber-800 mb-1">Impacto Matemático no Sistema</p>
              <p className="text-sm text-amber-700">
                Aviso: Atualize estes parâmetros exclusivamente em caso de aquisição de novos equipamentos, expansão do chão de fábrica ou mudança no formato das bandejas. 
                Com os valores atuais, a capacidade física do seu turno de produção é de <strong>{capacidadeTotalTurno.toLocaleString('pt-BR')} unidades</strong>.
              </p>
            </div>
          </div>

          {/* Ação Principal */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Save size={18} /> Salvar Parâmetros
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL DE SEGURANÇA (CONFIRMAÇÃO EM 2 ETAPAS) */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Confirmar Alteração Crítica?</h2>
              <p className="text-slate-500 font-medium text-sm px-2">
                Modificar a estrutura da fábrica mudará o cálculo de lotes (PCP) de todos os próximos orçamentos, afetando a rotina da produção.
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center gap-3">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors w-full"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarConfiguracoes} 
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors w-full shadow-sm"
              >
                Sim, Alterar Valores
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}