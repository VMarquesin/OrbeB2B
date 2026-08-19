import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ExternalLink, CheckCircle2, Truck, FileText, Loader2, AlertCircle } from 'lucide-react';
import { obterDetalhePedido, obterSimulacaoRecompra } from '../services/pedidosService';
import { useCart } from '../contexts/CartContext';

const STATUS_LOGISTICA_LABEL = {
  0: 'Aguardando Validação',
  1: 'Faturado',
  2: 'Em Separação',
  3: 'Enviado',
  4: 'Entregue',
  5: 'Cancelado',
};

const STATUS_CONFIG = {
  'Entregue':             { icon: CheckCircle2, className: 'bg-stone-50 text-stone-600 border border-stone-300' },
  'Em Separação':         { icon: Truck,        className: 'bg-orange-50 text-orange-600 border border-orange-200' },
  'Faturado':             { icon: FileText,     className: 'bg-sky-50 text-sky-600 border border-sky-200' },
  'Enviado':              { icon: Truck,        className: 'bg-blue-50 text-blue-600 border border-blue-200' },
  'Aguardando Validação': { icon: FileText,     className: 'bg-yellow-50 text-yellow-600 border border-yellow-200' },
  'Cancelado':            { icon: FileText,     className: 'bg-red-50 text-red-500 border border-red-200' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { icon: FileText, className: 'bg-stone-50 text-stone-500 border border-stone-200' };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      {status}
    </span>
  );
}

export default function DetalhesPedidoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [pedido, setPedido]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState(null);
  const [recomprando, setRecomprando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const data = await obterDetalhePedido(id);
        if (!cancelado) setPedido(data);
      } catch (err) {
        if (!cancelado) setErro(err.mensagemNormalizada ?? 'Pedido não encontrado.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [id]);

  async function handleRepetirPedido() {
    setRecomprando(true);
    try {
      // Busca simulação com preços atuais — segurança: clienteId vem do JWT
      const itens = await obterSimulacaoRecompra(id);

      // Adiciona apenas os produtos que ainda estão ativos
      const ativos = itens.filter((i) => i.estaAtivo);
      ativos.forEach((item) =>
        addItem({
          id:       item.produtoId,
          name:     item.descricao,
          image:    `https://placehold.co/400x280/C2856A/FFF?text=${encodeURIComponent(item.descricao.slice(0, 12))}`,
          qty:      item.quantidadeHistorica,
          packaging: { id: 'un', name: item.codigoComercial, units: 1 },
          price:    item.precoAtual,
        })
      );

      const inativos = itens.filter((i) => !i.estaAtivo);
      if (inativos.length > 0) {
        alert(`${ativos.length} produto(s) adicionados ao carrinho.\n\n${inativos.length} produto(s) indisponível(is) foram ignorados.`);
      }
      navigate('/portal/carrinho');
    } catch (err) {
      alert(err.mensagemNormalizada ?? 'Erro ao repetir pedido.');
    } finally {
      setRecomprando(false);
    }
  }

  // --- Estados de Loading / Erro ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-stone-500 font-medium">{erro ?? 'Pedido não encontrado.'}</p>
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

  const statusLabel = STATUS_LOGISTICA_LABEL[pedido.statusLogistica] ?? String(pedido.statusLogistica);
  const dataFormatada = new Date(pedido.dataCriacao).toLocaleDateString('pt-BR');
  const valorFormatado = `R$ ${Number(pedido.valorTotalPedido).toFixed(2)}`;

  const summaryFields = [
    { label: 'DATA DO PEDIDO',       value: dataFormatada },
    { label: 'CÓDIGO DO PEDIDO',     value: pedido.codigoPedidoFormatado },
    { label: 'VALOR TOTAL',          value: valorFormatado },
    { label: 'OBSERVAÇÃO',           value: pedido.observacaoNegociacao || '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/portal/pedidos')}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        Voltar para Histórico
      </button>

      {/* Title + badge */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-stone-900">
          Pedido #{pedido.codigoPedidoFormatado}
        </h1>
        <StatusBadge status={statusLabel} />
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-6 py-5">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          {summaryFields.map((field) => (
            <div key={field.label}>
              <dt className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">{field.label}</dt>
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
            {pedido.itens?.map((item) => (
              <div key={item.produtoId} className="flex items-center gap-4">
                <img
                  src={`https://placehold.co/64x64/C2856A/FFF?text=${encodeURIComponent((item.descricao ?? '').slice(0, 8))}`}
                  alt={item.descricao}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800">{item.descricao}</p>
                  <p className="text-xs text-stone-400 mt-0.5">Cód: {item.codigoComercial}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Quantidade</p>
                  <p className="text-sm font-semibold text-stone-700">{item.quantidadeSolicitada}</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-2 mb-0.5">Subtotal</p>
                  <p className="text-base font-bold text-stone-900">R$ {Number(item.subtotal).toFixed(2)}</p>
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
            disabled={recomprando}
            className="w-full flex items-center justify-center gap-2 py-3
              bg-primary hover:bg-primary-hover active:scale-[0.98]
              text-white font-semibold text-sm rounded-xl
              shadow-md shadow-primary/25 transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            {recomprando ? 'Carregando...' : 'Repetir Este Pedido'}
          </button>

          <div className="pt-2 text-center">
            <Link
              to="/portal/suporte"
              className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-primary transition"
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
