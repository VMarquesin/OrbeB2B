import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Download, ExternalLink, CheckCircle2, Truck, FileText } from 'lucide-react';
import { pedidosMock } from '../data/pedidosMock';
import { useCart } from '../contexts/CartContext';

const STATUS_CONFIG = {
  Entregue: {
    icon: CheckCircle2,
    className: 'bg-stone-50 text-stone-600 border border-stone-300',
  },
  'Em Separação': {
    icon: Truck,
    className: 'bg-orange-50 text-orange-600 border border-orange-200',
  },
  Faturado: {
    icon: FileText,
    className: 'bg-sky-50 text-sky-600 border border-sky-200',
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    icon: FileText,
    className: 'bg-stone-50 text-stone-500 border border-stone-200',
  };
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {status}
    </span>
  );
}

export default function DetalhesPedidoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCart } = useCart();

  const pedido = pedidosMock.find((p) => p.id === id);

  if (!pedido) {
    return (
      <div className="py-24 text-center">
        <p className="text-stone-500 font-medium">Pedido não encontrado.</p>
        <Link
          to="/portal/pedidos"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Voltar para Histórico
        </Link>
      </div>
    );
  }

  function handleRepetirPedido() {
    setCart(pedido.itens);
    navigate('/portal/carrinho');
  }

  function handleBaixarBoleto() {
    console.log(' Baixar Boleto', pedido.id);
  }

  const summaryFields = [
    { label: 'DATA DO PEDIDO', value: pedido.data },
    { label: 'FORMA DE PAGAMENTO', value: pedido.pagamento },
    { label: 'VALOR TOTAL', value: pedido.valor },
    { label: 'ENDEREÇO DE ENTREGA', value: pedido.endereco },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/portal/pedidos')}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500
          hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        Voltar para Histórico
      </button>

      {/* Title + badge */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-stone-900">
          Detalhes do Pedido #{pedido.id}
        </h1>
        <StatusBadge status={pedido.status} />
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-6 py-5">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          {summaryFields.map((field) => (
            <div key={field.label}>
              <dt className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                {field.label}
              </dt>
              <dd className="text-sm font-semibold text-stone-800">{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left — items list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-stone-800 mb-4 pb-4 border-b border-stone-100">
            Itens do Pedido
          </h2>

          <div className="space-y-4">
            {pedido.itens.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.nome}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800">{item.nome}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Cód: {item.codigo}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                    Quantidade
                  </p>
                  <p className="text-sm font-semibold text-stone-700">
                    {item.qty} {item.unidade}
                  </p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-2 mb-0.5">
                    Subtotal
                  </p>
                  <p className="text-base font-bold text-stone-900">{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — actions sidebar */}
        <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-3">
          <h2 className="text-base font-semibold text-stone-800 pb-4 border-b border-stone-100">
            Ações do Pedido
          </h2>

          <button
            onClick={handleRepetirPedido}
            className="w-full flex items-center justify-center gap-2 py-3
              bg-primary hover:bg-primary-hover active:scale-[0.98]
              text-white font-semibold text-sm rounded-xl
              shadow-md shadow-primary/25 transition-all duration-150"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            Repetir Este Pedido
          </button>

          <button
            onClick={handleBaixarBoleto}
            className="w-full flex items-center justify-center gap-2 py-3
              border border-stone-300 text-stone-700 hover:bg-stone-50
              font-semibold text-sm rounded-xl transition"
          >
            <Download className="w-4 h-4" strokeWidth={1.75} />
            Baixar Boleto
          </button>

          <div className="pt-2 text-center">
            <Link
              to="/portal/suporte"
              onClick={() => {
                console.log('Suporte para pedido', pedido.id);
              }}
              className="inline-flex items-center gap-1 text-xs text-stone-400
                hover:text-primary transition"
            >
              Precisa de ajuda com este pedido?
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
