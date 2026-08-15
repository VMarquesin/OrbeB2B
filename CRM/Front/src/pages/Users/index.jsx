import { useState, useMemo } from 'react';
import { 
  Shield, Users, Plus, Edit3, Trash2, CheckCircle2, X, ShieldAlert, Calendar
} from 'lucide-react';
import api from '../../services/api';

export default function GestaoUsuarios() {
  // 2. GAVETA VAZIA
  const [funcionarios, setFuncionario] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null);

  // Campos do formulário mapeados com empresa_funcionarios + dados de usuário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    departamento: '',
    data_admissao: new Date().toISOString().split('T')[0],
    acessos: []
  });

  const modulosDisponiveis = [
    { id: 'orcamentos', label: 'Gestão Orçamentária & PCP' },
    { id: 'financeiro', label: 'Financeiro & DRE' },
    { id: 'clientes', label: 'Gestão de Clientes (CRM)' },
    { id: 'produtos', label: 'Cadastro de Produtos' },
    { id: 'usuarios', label: 'Controle de Acesso (Admin)' }
  ];

  // 3. GATILHO DE BUSCA NO BACKEND
  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const resposta = await api.get('/api/usuarios');
        setFuncionario(resposta.data);
      } catch (erro) {
        console.error("Erro ao carregar colaboradores:", erro);
      }
    }

    carregarUsuarios();
  }, []);

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter(f => 
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [funcionarios, searchTerm]);

  const handleNovoFuncionario = () => {
    setFuncionarioEmEdicao(null);
    setFormData({
      nome: '',
      email: '',
      cargo: '',
      departamento: '',
      data_admissao: new Date().toISOString().split('T')[0],
      acessos: []
    });
    setIsModalOpen(true);
  };

  const handleEditarFuncionario = (func) => {
    setFuncionarioEmEdicao(func);
    setFormData({
      nome: func.nome,
      email: func.email,
      cargo: func.cargo,
      departamento: func.departamento,
      data_admissao: func.data_admissao ? func.data_admissao.split('T')[0] : '',
      acessos: func.acessos
    });
    setIsModalOpen(true);
  };

  const handleToggleModulo = (moduloId) => {
    setFormData(prev => {
      const jaTem = prev.acessos.includes(moduloId);
      if (jaTem) {
        return { ...prev, acessos: prev.acessos.filter(a => a !== moduloId) };
      } else {
        return { ...prev, acessos: [...prev.acessos, moduloId] };
      }
    });
  };

  // 4. SALVAMENTO ASSÍNCRONO CONECTADO À API
  const handleSalvarFuncionario = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cargo) {
      alert("Nome e Cargo são obrigatórios.");
      return;
    }

    const payload = {
      empresa_id: "emp-01",
      ...formData,
      data_admissao: new Date(formData.data_admissao).toISOString()
    };

    try {
      if (funcionarioEmEdicao) {
        // Descomente quando a rota PUT estiver pronta no C#
        await api.put(`/api/usuarios/${funcionarioEmEdicao.id}`, payload);
        
        setFuncionario(prev => prev.map(f => f.id === funcionarioEmEdicao.id ? { ...f, ...payload } : f));
      } else {
        // Descomente quando a rota POST estiver pronta no C#
        await api.post('/api/usuarios', payload);
        
        const novoFunc = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
          usuario_id: "usr-" + Math.floor(Math.random() * 1000),
          ...payload
        };
        setFuncionario(prev => [novoFunc, ...prev]);
      }
      setIsModalOpen(false);
    } catch (erro) {
      console.error("Erro ao salvar colaborador:", erro);
      alert("Ocorreu um erro ao comunicar com o servidor.");
    }
  };

  // 5. REMOÇÃO ASSÍNCRONA CONECTADA À API
  const handleRemoverFuncionario = async (id) => {
    if (window.confirm("Deseja remover este colaborador da empresa?")) {
      try {
        // Descomente quando a rota DELETE estiver pronta no C#
        await api.delete(`/api/usuarios/${id}`);
        
        setFuncionario(prev => prev.filter(f => f.id !== id));
      } catch (erro) {
        console.error("Erro ao remover colaborador:", erro);
        alert("Falha ao tentar remover o colaborador do banco de dados.");
      }
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Shield className="text-indigo-600" /> Controle de Acesso & Colaboradores
          </h1>
          <p className="text-slate-500 mt-1">Gerenciamento da tabela <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">empresa_funcionarios</code> e permissões.</p>
        </div>
        <button 
          onClick={handleNovoFuncionario}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Cadastrar Colaborador
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Users className="text-slate-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome, cargo ou departamento..." 
          className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold select-none">
              <th className="p-4">Colaborador</th>
              <th className="p-4">Cargo / Departamento</th>
              <th className="p-4">Data Admissão</th>
              <th className="p-4">Nível de Acesso (Módulos)</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {funcionariosFiltrados.map(func => (
              <tr key={func.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{func.nome}</p>
                  <p className="text-xs text-slate-400">{func.email}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-700">{func.cargo}</p>
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">{func.departamento}</span>
                </td>
                <td className="p-4 text-slate-600 text-xs font-medium">
                  {func.data_admissao ? new Date(func.data_admissao).toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {func.acessos.includes('ALL') ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">Acesso Total (Admin)</span>
                    ) : (
                      func.acessos.map(acc => (
                        <span key={acc} className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {acc}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => handleEditarFuncionario(func)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleRemoverFuncionario(func.id)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE FUNCIONÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
            
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">
                {funcionarioEmEdicao ? 'Editar Colaborador & Permissões' : 'Novo Colaborador (empresa_funcionarios)'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarFuncionario} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
                <input 
                  type="text" required
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: Jaqueline Silva"
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">E-mail Profissional *</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="jaqueline@acaseira.com.br"
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Cargo (cargo) *</label>
                  <input 
                    type="text" required maxLength="100"
                    value={formData.cargo}
                    onChange={e => setFormData({...formData, cargo: e.target.value})}
                    placeholder="Ex: Operadora de PCP"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Departamento (departamento)</label>
                  <input 
                    type="text" maxLength="100"
                    value={formData.departamento}
                    onChange={e => setFormData({...formData, departamento: e.target.value})}
                    placeholder="Ex: Produção"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Data de Admissão (data_admissao)</label>
                <input 
                  type="date"
                  value={formData.data_admissao}
                  onChange={e => setFormData({...formData, data_admissao: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium bg-white" 
                />
              </div>

              {/* MATRIZ DE PERMISSÕES DE ACESSO */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Permissões de Acesso aos Módulos</label>
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {modulosDisponiveis.map(mod => (
                    <label key={mod.id} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.acessos.includes('ALL') || formData.acessos.includes(mod.id)}
                        onChange={() => handleToggleModulo(mod.id)}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span className="text-sm font-bold text-slate-700">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                  Salvar Colaborador
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}