import { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Users, Plus, Edit3, Trash2, CheckCircle2, X, Eye, EyeOff, Loader2
} from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/Toast';

export default function GestaoUsuarios() {
  const [funcionarios, setFuncionario] = useState([]);
  const [perfisDisponiveis, setPerfisDisponiveis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [funcionarioEmEdicao, setFuncionarioEmEdicao] = useState(null);

  // Modal de confirmação de inativação
  const [isInativacaoOpen, setIsInativacaoOpen] = useState(false);
  const [funcionarioParaInativar, setFuncionarioParaInativar] = useState(null);
  const [loadingInativar, setLoadingInativar] = useState(false);

  // Modal de senha temporária (pós-criação)
  const [senhaModal, setSenhaModal] = useState({ open: false, senha: '' });

  const [formData, setFormData] = useState({
    perfilId: '',
    nome: '',
    email: '',
    cargo: '',
    departamento: '',
    data_admissao: new Date().toISOString().split('T')[0]
  });
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const carregarDados = async () => {
    try {
      const [resUsuarios, resPerfis] = await Promise.all([
        api.get(`/api/usuarios?incluirInativos=${incluirInativos}`),
        api.get('/api/lookups/perfis')
      ]);
      const usuariosMapeados = resUsuarios.data.map(u => ({
        ...u,
        id:           u.id           || u.Id,
        nome:         u.nome         || u.Nome         || '',
        email:        u.email        || u.Email        || '',
        nomePerfil:   u.nomePerfil   || u.NomePerfil   || '',
        estaAtivo:    u.estaAtivo    ?? u.EstaAtivo    ?? true,
        cargo:        u.cargo        || u.Cargo        || '',
        departamento: u.departamento || u.Departamento || '',
        dataAdmissao: u.dataAdmissao || u.DataAdmissao || u.data_admissao || ''
      }));
      setFuncionario(usuariosMapeados);
      setPerfisDisponiveis(resPerfis.data);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
      showToast("Erro ao carregar dados dos colaboradores.", "error");
    }
  };

  useEffect(() => {
    carregarDados();
  }, [incluirInativos]); // Recarrega sempre que o toggle mudar

  const funcionariosFiltrados = useMemo(() => {
    return (funcionarios || []).filter(f => 
      (f.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.departamento || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [funcionarios, searchTerm]);

  const handleNovoFuncionario = () => {
    setFuncionarioEmEdicao(null);
    setFormData({
      perfilId: '',
      nome: '',
      email: '',
      cargo: '',
      departamento: '',
      data_admissao: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEditarFuncionario = (func) => {
    setFuncionarioEmEdicao(func);
    setFormData({
      nome: func.nome || '',
      email: func.email || '',
      cargo: func.cargo || '',
      departamento: func.departamento || '',
      data_admissao: func.dataAdmissao ? func.dataAdmissao.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSalvarFuncionario = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.cargo) {
      showToast("Nome e Cargo são obrigatórios.", "error");
      return;
    }
    setLoadingSalvar(true);
    try {
      if (funcionarioEmEdicao) {
        const payloadPut = {
          nome: formData.nome,
          cargo: formData.cargo,
          departamento: formData.departamento
        };
        await api.put(`/api/usuarios/${funcionarioEmEdicao.id}`, payloadPut);
        showToast("Colaborador atualizado com sucesso!");
        setIsModalOpen(false);
      } else {
        const payloadPost = {
          perfilId: formData.perfilId,
          nome: formData.nome,
          email: formData.email,
          senha: "Mudar@123", 
          cargo: formData.cargo,
          departamento: formData.departamento
        };
        const res = await api.post('/api/usuarios', payloadPost);
        setIsModalOpen(false);
        // Exibe o modal com a senha temporária retornada pela API
        const senhaTemporaria = res.data?.senhaTemporaria || 'Mudar@123';
        setSenhaModal({ open: true, senha: senhaTemporaria });
      }
      carregarDados();
    } catch (erro) {
      console.error("Erro ao salvar:", erro);
      const msg = erro.response?.data?.mensagem || erro.response?.data?.errors;
      showToast(typeof msg === 'object' ? JSON.stringify(msg) : msg || "Falha de comunicação.", "error");
    } finally {
      setLoadingSalvar(false);
    }
  };

  const handleAbrirInativacao = (func) => {
    setFuncionarioParaInativar(func);
    setIsInativacaoOpen(true);
  };

  const handleConfirmarInativacao = async () => {
    if (!funcionarioParaInativar) return;
    setLoadingInativar(true);
    try {
      await api.patch(`/api/usuarios/${funcionarioParaInativar.id}/inativar`);
      showToast("Colaborador inativado com sucesso.");
      setIsInativacaoOpen(false);
      setFuncionarioParaInativar(null);
      carregarDados();
    } catch (erro) {
      console.error("Erro ao inativar:", erro);
      showToast("Erro ao inativar colaborador.", "error");
    } finally {
      setLoadingInativar(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Shield className="text-indigo-600" /> Controle de Acesso &amp; Colaboradores
          </h1>
          <p className="text-slate-500 mt-1">Gerenciamento da tabela <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs">empresa_funcionarios</code> e permissões.</p>
        </div>
        <button 
          onClick={handleNovoFuncionario}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus size={20} /> Cadastrar Colaborador
        </button>
      </div>

      {/* BARRA DE BUSCA + TOGGLE INATIVOS */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
        <Users className="text-slate-400 ml-2 shrink-0" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome, cargo ou departamento..." 
          className="w-full p-2 outline-none text-slate-700 font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none pr-2">
          <span className="text-sm font-bold text-slate-500 whitespace-nowrap">Mostrar Inativos</span>
          <div
            onClick={() => setIncluirInativos(prev => !prev)}
            className={`relative w-11 h-6 rounded-full transition-colors ${incluirInativos ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${incluirInativos ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold select-none">
              <th className="p-4">Colaborador</th>
              <th className="p-4">Cargo / Departamento</th>
              <th className="p-4">Data Admissão</th>
              <th className="p-4">Nível de Acesso</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {funcionariosFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="p-12 text-center text-slate-400 font-semibold">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            )}
            {funcionariosFiltrados.map(func => (
              <tr key={func.id} className={`hover:bg-slate-50 transition-colors ${!func.estaAtivo ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  <p className="font-bold text-slate-800">{func.nome}</p>
                  <p className="text-xs text-slate-400">{func.email}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-700">{func.cargo || <span className="text-slate-300 italic">—</span>}</p>
                  {func.departamento
                    ? <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">{func.departamento}</span>
                    : <span className="text-slate-300 italic text-xs">—</span>
                  }
                </td>
                <td className="p-4 text-slate-600 text-xs font-medium">
                  {func.dataAdmissao ? new Date(func.dataAdmissao).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {func.nomePerfil || 'Padrão'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {func.estaAtivo
                    ? <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Ativo</span>
                    : <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Inativo</span>
                  }
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => handleEditarFuncionario(func)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Editar">
                      <Edit3 size={16} />
                    </button>
                    {func.estaAtivo && (
                      <button onClick={() => handleAbrirInativacao(func)} className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Inativar">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
            
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">
                {funcionarioEmEdicao ? 'Editar Colaborador' : 'Novo Colaborador'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full cursor-pointer">
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
                  placeholder="jaqueline@empresa.com.br"
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium"
                  disabled={!!funcionarioEmEdicao}
                />
              </div>

              {!funcionarioEmEdicao && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Perfil de Acesso *</label>
                  <select
                    name="perfilId"
                    value={formData.perfilId}
                    onChange={(e) => setFormData({ ...formData, perfilId: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 bg-white"
                    required
                  >
                    <option value="">Selecione o nível de permissão...</option>
                    {(perfisDisponiveis || []).map((perfil) => (
                      <option key={perfil.id} value={perfil.id}>
                        {perfil.nomePerfil || perfil.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Cargo *</label>
                  <input 
                    type="text" required maxLength="100"
                    value={formData.cargo}
                    onChange={e => setFormData({...formData, cargo: e.target.value})}
                    placeholder="Ex: Operadora de PCP"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Departamento</label>
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
                <label className="block text-xs font-bold text-slate-500 uppercase">Data de Admissão</label>
                <input 
                  type="date"
                  value={formData.data_admissao}
                  onChange={e => setFormData({...formData, data_admissao: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 text-sm mt-1 font-medium bg-white" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingSalvar} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
                  {loadingSalvar ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE INATIVAÇÃO */}
      {isInativacaoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Trash2 size={28} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Inativar Colaborador</h2>
              <p className="text-slate-500 font-medium text-sm">
                Tem certeza que deseja inativar o colaborador <strong className="text-slate-700">{funcionarioParaInativar?.nome}</strong>? O acesso ao sistema será bloqueado, mas os dados serão mantidos.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => { setIsInativacaoOpen(false); setFuncionarioParaInativar(null); }}
                disabled={loadingInativar}
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarInativacao}
                disabled={loadingInativar}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {loadingInativar ? <><Loader2 size={18} className="animate-spin" /> Inativando...</> : 'Confirmar Inativação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE SENHA TEMPORÁRIA (PÓS-CRIAÇÃO) */}
      {senhaModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Colaborador Criado!</h2>
              <p className="text-slate-500 font-medium text-sm">
                O colaborador foi cadastrado com sucesso. Informe a senha temporária abaixo para o primeiro acesso:
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Senha Temporária</p>
                <p className="text-2xl font-black text-indigo-700 tracking-widest font-mono">{senhaModal.senha}</p>
              </div>
              <p className="text-xs text-slate-400">O colaborador deve alterar a senha no primeiro login.</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
              <button
                onClick={() => setSenhaModal({ open: false, senha: '' })}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}