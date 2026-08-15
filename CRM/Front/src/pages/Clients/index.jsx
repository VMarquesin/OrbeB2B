import { useState, useMemo } from 'react';
import { 
  Search, Users, Building2, UserCircle, AlertCircle, 
  Plus, Edit3, Archive, X, RotateCcw 
} from 'lucide-react';
import api from '../../services/api';


export default function GestaoClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('TODOS'); // 'TODOS', 'B2B', 'B2C', 'EM_RISCO', 'ARQUIVADOS'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);

  const [formData, setFormData] = useState({
    documento: '',
    nome_ou_razao_social: '',
    nome_fantasia: '',
    tipo_segmento: 'B2B',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: ''
  });
  // =========================================================================
  // 0. BUSCA REAL DOS DADOS (Conectando C# + PostgreSQL)
  // =========================================================================
  useEffect(() => {
    async function carregarClientes() {
      try {
        // Altere '/api/clientes' para a rota exata que o Backend definiu no Controller
        const resposta = await api.get('/api/clientes'); 
        setClientes(resposta.data);
      } catch (erro) {
        console.error("Erro ao buscar clientes no banco de dados:", erro);
      }
    }

    carregarClientes();
  }, []);
  
  // =========================================================================
  // 1. CÁLCULO DE MÉTRICAS DOS CARDS SUPERIORES
  // =========================================================================
  const metricas = useMemo(() => {
    const baseAtiva = clientes.filter(c => c.status_cadastro === 'ATIVO' || c.status_cadastro === 'EM_RISCO').length;
    const atacadoB2B = clientes.filter(c => c.tipo_segmento === 'B2B' && c.status_cadastro !== 'ARQUIVADO').length;
    const varejoB2C = clientes.filter(c => c.tipo_segmento === 'B2C' && c.status_cadastro !== 'ARQUIVADO').length;
    const emRisco = clientes.filter(c => c.status_cadastro === 'EM_RISCO').length;
    
    return { baseAtiva, atacadoB2B, varejoB2C, emRisco };
  }, [clientes]);

  // =========================================================================
  // 2. LÓGICA DE FILTRAGEM (BLINDADA CONTRA TELA BRANCA)
  // =========================================================================
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
      // Blindagem do campo de busca
      const termo = (searchTerm || '').toLowerCase();
      const nomeRazao = (c.nome_ou_razao_social || '').toLowerCase();
      const fantasia = (c.nome_fantasia || '').toLowerCase();
      const doc = (c.documento || '').toLowerCase();

      const matchSearch = nomeRazao.includes(termo) || fantasia.includes(termo) || doc.includes(termo);

      // Lógica dos Botões de Filtro
      let matchFiltro = true;
      if (filtroAtivo === 'B2B') matchFiltro = c.tipo_segmento === 'B2B' && c.status_cadastro !== 'ARQUIVADO';
      if (filtroAtivo === 'B2C') matchFiltro = c.tipo_segmento === 'B2C' && c.status_cadastro !== 'ARQUIVADO';
      if (filtroAtivo === 'EM_RISCO') matchFiltro = c.status_cadastro === 'EM_RISCO';
      if (filtroAtivo === 'ARQUIVADOS') matchFiltro = c.status_cadastro === 'ARQUIVADO';
      
      // Se for "TODOS", ocultamos os arquivados para manter a lista limpa, 
      // a menos que o usuário clique explicitamente em "Arquivados".
      if (filtroAtivo === 'TODOS') matchFiltro = c.status_cadastro !== 'ARQUIVADO';

      return matchSearch && matchFiltro;
    });
  }, [clientes, searchTerm, filtroAtivo]);

  // =========================================================================
  // 3. FUNÇÕES DO MODAL, FORMULÁRIO E AÇÕES DE TABELA
  // =========================================================================
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  const handleNovoCliente = () => {
    setClienteEmEdicao(null);
    setFormData({
      documento: '', nome_ou_razao_social: '', nome_fantasia: '',
      tipo_segmento: 'B2B', cep: '', logradouro: '', numero: '', bairro: ''
    });
    setIsModalOpen(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteEmEdicao(cliente);
    setFormData({
      documento: cliente.documento || '',
      nome_ou_razao_social: cliente.nome_ou_razao_social || '',
      nome_fantasia: cliente.nome_fantasia || '',
      tipo_segmento: cliente.tipo_segmento || 'B2B',
      cep: cliente.cep || '',
      logradouro: cliente.logradouro || '',
      numero: cliente.numero || '',
      bairro: cliente.bairro || ''
    });
    setIsModalOpen(true);
  };

  const handleSalvarCliente = (e) => {
    e.preventDefault();
    
    if (!formData.nome_ou_razao_social || !formData.documento) {
      alert("Razão Social e Documento são obrigatórios.");
      return;
    }

    if (clienteEmEdicao) {
      setClientes(prev => prev.map(c => c.id === clienteEmEdicao.id ? { ...c, ...formData } : c));
    } else {
      const novoCliente = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        empresa_id: "emp-01",
        ...formData,
        status_cadastro: "ATIVO",
        data_cadastro: new Date().toISOString(),
        ultima_compra: null
      };
      setClientes(prev => [novoCliente, ...prev]);
    }
    setIsModalOpen(false);
  };

  // FUNÇÃO RESTAURADA: ARQUIVAR / REATIVAR CLIENTE (TOGGLE)
  const handleToggleStatusCliente = (cliente) => {
    if (cliente.status_cadastro === 'ARQUIVADO') {
      if (window.confirm(`Deseja REATIVAR o cliente ${cliente.nome_ou_razao_social}?`)) {
        setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, status_cadastro: 'ATIVO' } : c));
      }
    } else {
      if (window.confirm(`Deseja realmente ARQUIVAR / INATIVAR o cliente ${cliente.nome_ou_razao_social}?`)) {
        setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, status_cadastro: 'ARQUIVADO' } : c));
      }
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Users className="text-amber-500" /> Gestão de Clientes
          </h1>
          <p className="text-slate-500 mt-1">CRM integrado para análise de retenção e segmentação de base.</p>
        </div>
        <button 
          onClick={handleNovoCliente}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={20} /> Cadastrar Cliente
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Base Total Ativa</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.baseAtiva}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building2 size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Atacado (B2B)</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.atacadoB2B}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><UserCircle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Varejo (B2C)</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.varejoB2C}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase">Em Risco {`{> 30D}`}</p>
            <h3 className="text-2xl font-black text-slate-800">{metricas.emRisco}</h3>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 w-full xl:flex-1 pl-2">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar cliente por nome, razão social ou CNPJ/CPF..." 
            className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button 
            onClick={() => setFiltroAtivo('TODOS')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'TODOS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFiltroAtivo('B2B')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'B2B' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Atacado (B2B)
          </button>
          <button 
            onClick={() => setFiltroAtivo('B2C')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'B2C' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Varejo (B2C)
          </button>
          
          <button 
            onClick={() => setFiltroAtivo('EM_RISCO')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'EM_RISCO' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'}`}
          >
            Em Risco
          </button>

          <button 
            onClick={() => setFiltroAtivo('ARQUIVADOS')} 
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${filtroAtivo === 'ARQUIVADOS' ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Arquivados / Inativos
          </button>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold select-none">
                <th className="p-4">Cliente / Empresa</th>
                <th className="p-4">Documento</th>
                <th className="p-4 text-center">Segmento</th>
                <th className="p-4 text-center">Última Compra</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{cliente.nome_ou_razao_social}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Fantasia: {cliente.nome_fantasia || 'N/A'}</p>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-xs font-semibold">{cliente.documento}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${cliente.tipo_segmento === 'B2B' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {cliente.tipo_segmento}
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-600 font-medium">
                    {formatDate(cliente.ultima_compra)}
                  </td>
                  <td className="p-4 text-center">
                    {cliente.status_cadastro === 'ATIVO' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Ativo</span>}
                    {cliente.status_cadastro === 'EM_RISCO' && <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">Em Risco ({`> 30d`})</span>}
                    {cliente.status_cadastro === 'ARQUIVADO' && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Arquivado</span>}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => handleEditarCliente(cliente)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      {/* BOTÃO TOGGLE RESTAURADO: ARQUIVAR / REATIVAR */}
                      <button 
                        onClick={() => handleToggleStatusCliente(cliente)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          cliente.status_cadastro === 'ARQUIVADO' 
                            ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50' 
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={cliente.status_cadastro === 'ARQUIVADO' ? "Reativar Cliente" : "Arquivar/Inativar"}
                      >
                        {cliente.status_cadastro === 'ARQUIVADO' ? <RotateCcw size={16} /> : <Archive size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 font-semibold">
                    Nenhum cliente encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO / EDIÇÃO DE CLIENTE */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
            
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">
                {clienteEmEdicao ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarCliente} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Razão Social / Nome Completo *</label>
                  <input 
                    type="text" required maxLength="150"
                    value={formData.nome_ou_razao_social}
                    onChange={e => setFormData({...formData, nome_ou_razao_social: e.target.value})}
                    placeholder="Ex: Mercadinho da Praça Ltda"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Nome Fantasia</label>
                  <input 
                    type="text" maxLength="150"
                    value={formData.nome_fantasia}
                    onChange={e => setFormData({...formData, nome_fantasia: e.target.value})}
                    placeholder="Ex: Mercadinho da Praça"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Documento (CPF/CNPJ) *</label>
                  <input 
                    type="text" required maxLength="20"
                    value={formData.documento}
                    onChange={e => setFormData({...formData, documento: e.target.value})}
                    placeholder="00.000.000/0000-00"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium font-mono" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Segmento de Venda *</label>
                  <select 
                    value={formData.tipo_segmento}
                    onChange={e => setFormData({...formData, tipo_segmento: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-bold bg-white cursor-pointer text-slate-700"
                  >
                    <option value="B2B">Atacado (B2B)</option>
                    <option value="B2C">Varejo (B2C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">CEP</label>
                  <input 
                    type="text" maxLength="10"
                    value={formData.cep}
                    onChange={e => setFormData({...formData, cep: e.target.value})}
                    placeholder="00000-000"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div className="md:col-span-2 flex gap-4">
                  <div className="flex-[3]">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Logradouro / Rua</label>
                    <input 
                      type="text" maxLength="150"
                      value={formData.logradouro}
                      onChange={e => setFormData({...formData, logradouro: e.target.value})}
                      placeholder="Av. Brasil"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Número</label>
                    <input 
                      type="text" maxLength="20"
                      value={formData.numero}
                      onChange={e => setFormData({...formData, numero: e.target.value})}
                      placeholder="123"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Bairro</label>
                  <input 
                    type="text" maxLength="100"
                    value={formData.bairro}
                    onChange={e => setFormData({...formData, bairro: e.target.value})}
                    placeholder="Centro"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm mt-1 font-medium" 
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer">
                  Salvar Cliente
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}