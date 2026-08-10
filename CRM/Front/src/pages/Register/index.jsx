import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, User, Mail, Lock, 
  ArrowRight, CheckCircle2, Factory 
} from 'lucide-react';

export default function CadastroEmpresa() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); // 1: Dados da Empresa, 2: Endereço, 3: Administrador
  const [isLoading, setIsLoading] = useState(false);

  // Mapeamento exato com as colunas das tabelas: empresas e usuarios
  const [formData, setFormData] = useState({
    // Tabela: empresas
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade_nome: '',
    estado_sigla: '',
    
    // Tabela: usuarios (Primeiro Admin)
    nome_admin: '',
    email_admin: '',
    senha_hash: '',
    confirmar_senha: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (etapa < 3) setEtapa(etapa + 1);
  };

  const handlePrevStep = () => {
    if (etapa > 1) setEtapa(etapa - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.senha_hash !== formData.confirmar_senha) {
      alert("As senhas não conferem!");
      return;
    }

    setIsLoading(true);

    // Simulação de chamada para a API (POST /api/empresas/registrar)
    setTimeout(() => {
      setIsLoading(false);
      alert("Empresa cadastrada com sucesso! Faça seu login.");
      navigate('/'); // Redireciona para o Login
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200">
        
        {/* Painel Lateral Informativo */}
        <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Factory className="text-amber-500" size={28} />
              <span className="text-xl font-black tracking-tight uppercase">ORBE B2B</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Crie sua conta corporativa</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Configure seu ERP industrial em poucos passos. Gerencie sua esteira de produção, orçamentos B2B e DRE em um único ambiente.
            </p>
          </div>

          {/* Indicador de Progresso */}
          <div className="mt-12 space-y-4">
            <div className={`flex items-center gap-3 ${etapa >= 1 ? 'text-amber-500' : 'text-slate-600'}`}>
              <CheckCircle2 size={20} className={etapa > 1 ? 'text-emerald-500' : ''} />
              <span className="text-sm font-bold">1. Dados da Empresa</span>
            </div>
            <div className={`flex items-center gap-3 ${etapa >= 2 ? 'text-amber-500' : 'text-slate-600'}`}>
              <CheckCircle2 size={20} className={etapa > 2 ? 'text-emerald-500' : ''} />
              <span className="text-sm font-bold">2. Localização (Sede)</span>
            </div>
            <div className={`flex items-center gap-3 ${etapa >= 3 ? 'text-amber-500' : 'text-slate-600'}`}>
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">3. Perfil de Acesso</span>
            </div>
          </div>
        </div>

        {/* Formulário Interativo */}
        <div className="md:w-2/3 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-black text-slate-800">
              {etapa === 1 && 'Informações Fiscais'}
              {etapa === 2 && 'Endereço Sede'}
              {etapa === 3 && 'Usuário Administrador'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">Preencha os dados de acordo com o cartão CNPJ.</p>
          </div>

          <form onSubmit={etapa === 3 ? handleSubmit : handleNextStep} className="space-y-6">
            
            {/* ETAPA 1: EMPRESA */}
            {etapa === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" name="cnpj" required maxLength="18"
                      value={formData.cnpj} onChange={handleChange}
                      placeholder="00.000.000/0000-00"
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-mono font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Razão Social *</label>
                  <input 
                    type="text" name="razao_social" required
                    value={formData.razao_social} onChange={handleChange}
                    placeholder="Sua Empresa Indústria e Comércio Ltda"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Fantasia</label>
                  <input 
                    type="text" name="nome_fantasia"
                    value={formData.nome_fantasia} onChange={handleChange}
                    placeholder="Nome conhecido no mercado"
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            {/* ETAPA 2: ENDEREÇO */}
            {etapa === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CEP *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" name="cep" required maxLength="9"
                        value={formData.cep} onChange={handleChange}
                        placeholder="00000-000"
                        className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logradouro / Rua *</label>
                    <input 
                      type="text" name="logradouro" required
                      value={formData.logradouro} onChange={handleChange}
                      placeholder="Ex: Av. das Indústrias"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número *</label>
                    <input 
                      type="text" name="numero" required
                      value={formData.numero} onChange={handleChange}
                      placeholder="S/N"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bairro *</label>
                    <input 
                      type="text" name="bairro" required
                      value={formData.bairro} onChange={handleChange}
                      placeholder="Distrito Industrial"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cidade *</label>
                    <input 
                      type="text" name="cidade_nome" required
                      value={formData.cidade_nome} onChange={handleChange}
                      placeholder="Ex: Pompéia"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">UF *</label>
                    <input 
                      type="text" name="estado_sigla" required maxLength="2"
                      value={formData.estado_sigla} onChange={handleChange}
                      placeholder="SP"
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium uppercase text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3: USUÁRIO MASTER */}
            {etapa === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo (Admin) *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" name="nome_admin" required
                      value={formData.nome_admin} onChange={handleChange}
                      placeholder="Seu nome"
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail Corporativo *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" name="email_admin" required
                      value={formData.email_admin} onChange={handleChange}
                      placeholder="diretoria@empresa.com.br"
                      className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" name="senha_hash" required minLength="6"
                        value={formData.senha_hash} onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmar Senha *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="password" name="confirmar_senha" required minLength="6"
                        value={formData.confirmar_senha} onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ações (Botões Base) */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-100">
              {etapa > 1 ? (
                <button 
                  type="button" 
                  onClick={handlePrevStep}
                  className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Voltar
                </button>
              ) : (
                <Link to="/" className="px-6 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                  Já tenho conta
                </Link>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? 'Processando...' : (etapa === 3 ? 'Finalizar Cadastro' : 'Avançar')}
                {!isLoading && etapa < 3 && <ArrowRight size={18} />}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}