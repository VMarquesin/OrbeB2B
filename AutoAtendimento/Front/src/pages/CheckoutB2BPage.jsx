import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ArrowLeft,
  ArrowRight,
  Truck,
  Package,
  ShieldCheck,
  Lock,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { criarPedido } from '../services/pedidosService';
import { obterMeuPerfil } from '../services/cadastroService';

export default function CheckoutB2BPage() {
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState('');
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  // ── Dados do cliente buscados da API ────────────────────────────────────────
  const [dadosCliente, setDadosCliente]         = useState(null);
  const [loadingPerfil, setLoadingPerfil]       = useState(true);
  const [erroPerfil, setErroPerfil]             = useState('');

  useEffect(() => {
    let cancelado = false;
    async function carregarPerfil() {
      setLoadingPerfil(true);
      setErroPerfil('');
      try {
        const data = await obterMeuPerfil();
        if (!cancelado && data) setDadosCliente(data);
      } catch (err) {
        if (!cancelado)
          setErroPerfil(err.mensagemNormalizada ?? 'Não foi possível carregar os dados de entrega.');
      } finally {
        if (!cancelado) setLoadingPerfil(false);
      }
    }
    carregarPerfil();
    return () => { cancelado = true; };
  }, []);

  // ── Formatações ─────────────────────────────────────────────────────────────
  const cnpjFormatado = dadosCliente?.cnpj && dadosCliente.cnpj.length === 14
    ? dadosCliente.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    : (dadosCliente?.cnpj || '—');

  const enderecoCompleto = dadosCliente
    ? [dadosCliente.logradouro, dadosCliente.numero, dadosCliente.bairro]
        .filter(Boolean)
        .join(', ')
    : 'Carregando...';

  const cidadeEstadoCep = dadosCliente
    ? [dadosCliente.cidade, dadosCliente.uf, dadosCliente.cep ? `CEP ${dadosCliente.cep}` : '']
        .filter(Boolean)
        .join(' — ')
    : '';

  // ── Cálculos do carrinho ─────────────────────────────────────────────────────
  const subtotal = cartItems.reduce(
    (total, item) => total + ((item.price || 0) * item.qty),
    0
  );
  const totalItens = cartItems.reduce((t, item) => t + item.qty, 0);

  // ── Finalizar pedido ─────────────────────────────────────────────────────────
  async function handleFinalize(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // Zero Trust: clienteId e tenantId vêm do JWT no back-end.
      // Nenhuma informação de pagamento é enviada — negociado diretamente no CRM/ERP.
      const resposta = await criarPedido({
        itens: cartItems.map((item) => ({
          produtoId:     item.id,
          quantidade:    item.qty,
          precoUnitario: item.price,
        })),
      });

      clearCart();

      navigate('/portal/confirmado', {
        state: {
          orderId:    resposta.codigo,
          valorTotal: resposta.valorTotal,
        },
      });
    } catch (err) {
      setErro(err.mensagemNormalizada ?? 'Erro ao finalizar pedido. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header do Checkout */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/portal" className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" strokeWidth={1.75} />
              <span className="text-base font-bold text-stone-900">
                A Caseira{' '}
                <span className="text-primary">| Portal B2B</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
                Checkout Seguro
              </span>
              <Link to="/portal/suporte" className="hover:text-stone-900 transition">
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Voltar */}
        <Link
          to="/portal"
          className="
            inline-flex items-center gap-2
            px-4 py-2.5 mb-6
            rounded-xl bg-primary/10 text-primary
            text-sm font-semibold
            hover:bg-primary hover:text-white
            transition-all duration-200
          "
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Voltar para o Catálogo
        </Link>

        <h1 className="text-2xl font-bold text-stone-900 mb-8">
          Finalizar Pedido
        </h1>

        <form
          onSubmit={handleFinalize}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          {/* ── Coluna esquerda ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Dados de Entrega */}
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800">
                  <Truck className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  Dados de Entrega
                </h2>
              </div>

              {/* Loading do perfil */}
              {loadingPerfil && (
                <div className="mt-6 flex items-center gap-3 text-stone-400">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Carregando dados cadastrais...</span>
                </div>
              )}

              {/* Erro ao carregar perfil */}
              {erroPerfil && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{erroPerfil}</p>
                </div>
              )}

              {/* Dados reais */}
              {!loadingPerfil && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Empresa</p>
                    <p className="font-semibold text-stone-800">
                      {dadosCliente?.razaoSocial || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">CNPJ</p>
                    <p className="font-semibold text-stone-800">{cnpjFormatado}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs text-stone-400 mb-1">Endereço de entrega</p>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                      <p className="font-semibold text-stone-800">
                        {enderecoCompleto || '—'}
                      </p>
                      {cidadeEstadoCep && (
                        <p className="text-sm text-stone-500 mt-1">{cidadeEstadoCep}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 text-xs text-stone-400">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  O endereço cadastrado na empresa será utilizado para a entrega.
                  Para alterações, acesse <strong>Perfil → Solicitar alteração de endereço</strong>.
                </p>
              </div>
            </section>

            {/* Resumo do Carrinho */}
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-semibold text-stone-800 pb-4 border-b border-stone-100">
                <Package className="w-4 h-4 text-primary" strokeWidth={1.75} />
                Resumo do Carrinho
              </h2>
              <div className="mt-4 space-y-4">
                {cartItems.map(item => (
                  <div
                    key={`${item.id}-${item.packaging?.id}`}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-100"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-400">{item.packaging?.name}</p>
                      <p className="text-xs text-stone-400">Quantidade: {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold text-stone-800">
                      R$ {(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Coluna direita: Resumo da Compra ── */}
          <div className="lg:sticky lg:top-24">
            <section className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-stone-800 pb-4 border-b border-stone-100">
                Resumo da Compra
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frete (Logística A Caseira)</span>
                  <span className="font-semibold text-emerald-600">Grátis</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Descontos</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between items-end">
                  <span className="font-bold text-stone-900">Total</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      R$ {subtotal.toFixed(2)}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5 max-w-[160px] leading-relaxed">
                      Condições de pagamento serão alinhadas com seu fornecedor após o envio.
                    </p>
                  </div>
                </div>
              </div>

              {erro && (
                <p className="mt-3 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5
                  bg-primary hover:bg-primary-hover active:scale-[0.98]
                  text-white font-semibold rounded-xl
                  shadow-md shadow-primary/25 transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Finalizar Encomenda'}
                {!loading && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
              </button>

              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
                Ambiente seguro e criptografado
              </p>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
