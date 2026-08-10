import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Store } from 'lucide-react';

export default function PedidoConfirmadoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId ?? '10493';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center">
          <Link to="/portal" className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <span className="text-base font-bold text-stone-900">
              A Caseira{' '}
              <span className="text-primary">| Portal B2B</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2
                className="w-10 h-10 text-emerald-600"
                strokeWidth={1.75}
              />
            </div>
          </div>

          {/* Texts */}
          <h1 className="text-2xl font-bold text-stone-900">
            Pedido Enviado com Sucesso!
          </h1>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed">
            Seu pedido{' '}
            <span className="font-semibold text-stone-700">#{orderId}</span> foi
            encaminhado para a fábrica e será processado em breve. Você receberá
            atualizações pelo sistema.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/portal/pedidos')}
              className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover
                text-white font-semibold text-sm rounded-xl shadow-md shadow-primary/25
                transition-all active:scale-[0.98]"
            >
              Acompanhar Pedido
            </button>
            <button
              onClick={() => navigate('/portal')}
              className="w-full sm:w-auto px-6 py-3 border-2 border-stone-300
                text-stone-700 hover:bg-stone-50 font-semibold text-sm rounded-xl transition"
            >
              Voltar para o Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
