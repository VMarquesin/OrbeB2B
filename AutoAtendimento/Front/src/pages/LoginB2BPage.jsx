import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Building2, Lock, LogIn, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.jpg';

const MOCK_USER = {
  cnpj: '99.999.999/9999-99',
  password: 'caseira',
};

export default function LoginB2BPage() {
  const [cnpj, setCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function formatCnpj(value) {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  function handleCnpjChange(e) {
    setCnpj(formatCnpj(e.target.value));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (cnpj === MOCK_USER.cnpj && password === MOCK_USER.password) {
      setError('');
      navigate('/portal');
    } else {
      setError('CNPJ ou senha inválidos. Verifique suas credenciais.');
    }
  }
  return (
    <div className="relative min-h-screen bg-stone-100 flex flex-col items-center justify-center">
      <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto h-full flex items-center px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
           src={logo}
            alt="A Caseira"
            className="h-20 object-contain"
         />
         <span className="text-black font-bold text-lg">A Caseira</span>
        </Link>
        </div>
      </header>
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-primary" />
        <div className="px-8 py-8 flex flex-col items-center">
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">A Caseira</h1>
          <p className="text-sm text-stone-400 mt-0.5 mb-7">Portal B2B</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            
            {/* CNPJ field */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">
                CNPJ
              </label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                  strokeWidth={1.75}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50
                    text-stone-800 placeholder-stone-300
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition"
                />
              </div>
            </div>

            {/* Senha field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary-hover font-medium transition"
                >
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                  strokeWidth={1.75}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-stone-200 rounded-lg bg-stone-50
                    text-stone-800 placeholder-stone-300
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 mt-2
                bg-primary hover:bg-primary-hover active:scale-[0.98]
                text-white font-semibold rounded-lg shadow-md shadow-primary/30
                transition-all duration-150"
            >
              Entrar
              <LogIn className="w-4 h-4" strokeWidth={2} />
            </button>
          </form>

          {/* Parceiro link */}
          <p className="mt-5 text-xs text-stone-400 text-center">
            Ainda não é parceiro?{' '}
            <Link
              to="/seja-parceiro"
              className="text-primary hover:text-primary-hover font-medium underline underline-offset-2 transition"
            >
              Solicite seu acesso.
            </Link>
          </p>
        </div>
      </div>

      {/* Test credentials */}
      <div className="mt-4 w-full max-w-sm bg-primary/5 border border-primary/20 rounded-xl px-5 py-3.5">
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Credenciais de teste</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">CNPJ</span>
            <span className="font-mono text-stone-700">99.999.999/9999-99</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Senha</span>
            <span className="font-mono text-stone-700">caseira</span>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="mt-4 flex items-center gap-1.5 text-stone-400 text-xs">
        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
        <span>Acesso Seguro e Criptografado</span>
      </div>
    </div>
  );
}
