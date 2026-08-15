import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Building2, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmeter = async (e) => {
    e.preventDefault();
    setErro('');
    setIsLoading(true); // Trava o botão
    
    try {
      const sucesso = await login(email, password);
      
      if (!sucesso) {
        setErro('E-mail ou senha incorretos. Tente novamente.');
      }
    } catch (err) {
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setIsLoading(false); // Libera o botão
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors relative overflow-hidden">
      
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Box Principal de Login */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 relative z-10 transition-colors">
        
        {/* Título do Projeto */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ORBE <span className="text-amber-500">B2B</span></h1>
          <h2 className="text-lg font-bold text-slate-600 mt-2">Empresa A Caseira</h2>
          <p className="text-slate-500 text-sm mt-1">A tradição do sabor unida à tecnologia de gestão.</p>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm transition-colors">
            <AlertCircle size={16} />
            {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmeter} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
              E-mail Profissional
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="usuario@email.com.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              
              <input
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha secreta"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 transition-colors">
              <input type="checkbox" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
              Lembrar de mim
            </label>
            <a href="#" className="text-amber-500 hover:text-amber-600 font-medium transition-colors">
              Esqueceu a senha?
            </a>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm cursor-pointer"
          >
            Entrar no Sistema <ArrowRight size={18} />
          </button>
          
        </form>

        {/* Link para Cadastro de Nova Empresa */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Ainda não possui uma conta corporativa?{' '}
          <Link to="/cadastro" className="text-amber-500 hover:text-amber-600 font-bold transition-colors">
            Cadastre sua empresa
          </Link>
        </div>
        
        {/* Credenciais de Teste */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <p>Credenciais de Teste:</p>
          <p className="mt-1">Admin: <b>admin@acaseira.com.br</b> | <b>admin123</b></p>
          <p>Operador: <b>vendas@acaseira.com.br</b> | <b>vendas123</b></p>
        </div>

      </div>
    </div>
  );
}