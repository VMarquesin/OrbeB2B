import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, ShoppingCart, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { obterProdutos } from '../services/vitrineService';
import { obterUsuarioLogado } from '../services/authService';
import { obterMeusPedidos } from '../services/pedidosService';

// Gera placeholder visual enquanto não temos imagens reais
function produtoImagem(descricao) {
  return `https://placehold.co/400x280/C2856A/FFF?text=${encodeURIComponent(
    (descricao ?? 'Produto').slice(0, 14)
  )}`;
}

export default function DashboardLojistaPage() {
  const { addItem } = useCart();

  const [showCartMessage, setShowCartMessage] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // ── Dados do usuário logado (lidos do localStorage — zero request extra) ──
  const usuario = obterUsuarioLogado();
  const nomeEmpresa = usuario?.nomeCliente ?? 'sua empresa';

  // ── Estado: Produtos em destaque (primeiros 4 da vitrine) ──
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState(null);

  // ── Estado: Último pedido ──
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const [loadingPedido, setLoadingPedido] = useState(true);

  // Carrega vitrine (slice dos primeiros 4 como "Destaques")
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setLoadingProdutos(true);
      setErroProdutos(null);
      try {
        const data = await obterProdutos();
        if (!cancelado) setProdutos(data.slice(0, 4));
      } catch (err) {
        if (!cancelado) setErroProdutos(err.mensagemNormalizada ?? 'Erro ao carregar produtos.');
      } finally {
        if (!cancelado) setLoadingProdutos(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  // Carrega histórico para exibir o último pedido no card de boas-vindas
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setLoadingPedido(true);
      try {
        const data = await obterMeusPedidos();
        if (!cancelado && data.length > 0) setUltimoPedido(data[0]);
      } catch {
        // Silencioso — o card de último pedido é secundário
      } finally {
        if (!cancelado) setLoadingPedido(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  // ── Adicionar ao carrinho com o shape correto (UUID real da API) ──
  function handleAdicionar(produto) {
    addItem({
      id: produto.id,           // UUID real — vai ao checkout corretamente
      name: produto.descricao,
      image: produtoImagem(produto.descricao),
      qty: 1,
      price: produto.preco,
      packaging: {
        id: 'un',
        name: produto.embalagem,
        units: 1,
      },
    });

    setCartMessage(`${produto.name} foi adicionado ao carrinho!`);
    setShowCartMessage(true);

    setTimeout(() => {
      setShowCartMessage(false);
    }, 2500);
  }

  // Label de status (enum int → string)
  const STATUS_LABEL = { 0: 'Ag. Validação', 1: 'Faturado', 2: 'Em Separação', 3: 'Enviado', 4: 'Entregue', 5: 'Cancelado' };

  return (
    <div className="space-y-10">
      {showCartMessage && (
        <div className="fixed top-20 right-6 z-[9999] flex items-center gap-4 bg-white border-2 border-green-300 rounded-xl px-5 py-4 shadow-2xl min-w-[360px] animate-in slide-in-from-right-5 duration-300">

          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-green-100">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>

          <div className="flex-1">
            <p className="text-base font-bold text-stone-800">
              Produto adicionado!
            </p>

            <p className="text-sm text-stone-600 mt-1">
              {cartMessage}
            </p>
          </div>

          <button
            onClick={() => setShowCartMessage(false)}
            className="text-stone-400 hover:text-stone-700 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 capitalize">
          Olá, {nomeEmpresa}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Aqui estão as novidades e seus pedidos recentes.
        </p>
      </div>

      {/* ── Card: Último pedido ── */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-stone-800">Histórico de Compras</h2>
            {ultimoPedido && (
              <p className="text-xs text-stone-400 mt-0.5">
                Último pedido em {new Date(ultimoPedido.dataCriacao).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {ultimoPedido && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-100 text-sky-700 shrink-0">
              {STATUS_LABEL[ultimoPedido.statusLogistica] ?? '—'}
            </span>
          )}
        </div>

        {loadingPedido && (
          <div className="flex items-center gap-2 text-stone-400 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando...
          </div>
        )}

        {!loadingPedido && ultimoPedido && (
          <div className="border-t border-stone-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-stone-400">
                Pedido {ultimoPedido.codigoPedidoFormatado}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {ultimoPedido.quantidadeItens ?? '—'} {ultimoPedido.quantidadeItens === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-2xl font-bold text-stone-900">
                R$ {Number(ultimoPedido.valorTotalPedido).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {!loadingPedido && !ultimoPedido && (
          <p className="text-sm text-stone-400 py-2">Nenhum pedido realizado ainda.</p>
        )}

        <div className="mt-5">
          <Link
            to="/portal/pedidos"
            className="inline-flex items-center gap-2 px-5 py-2.5
              bg-primary hover:bg-primary-hover active:scale-[0.98]
              text-white text-sm font-semibold rounded-full
              shadow-sm shadow-primary/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            Ver Histórico de Pedidos
          </Link>
        </div>
      </div>

      {/* ── Catálogo em Destaque ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-stone-900 border-b-2 border-primary pb-0.5">
            Catálogo em Destaque
          </h2>
          <Link
            to="/portal/catalogo"
            className="text-sm text-primary font-medium flex items-center gap-1 hover:text-primary-hover transition"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading */}
        {loadingProdutos && (
          <div className="flex items-center justify-center py-20 gap-3 text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm">Carregando destaques...</span>
          </div>
        )}

        {/* Erro */}
        {!loadingProdutos && erroProdutos && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-500">
            <AlertCircle className="w-7 h-7" />
            <p className="text-sm">{erroProdutos}</p>
          </div>
        )}

        {/* Grid de produtos */}
        {!loadingProdutos && !erroProdutos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {produtos.map((produto) => (
              <Link
                key={produto.id}
                to={`/portal/produto/${produto.id}`}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
              >
                <img
                  src={produtoImagem(produto.descricao)}
                  alt={produto.descricao}
                  className="w-full h-36 object-cover"
                />
                <div className="p-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    {produto.embalagem}
                  </p>
                  <h3 className="text-sm font-semibold text-stone-800 leading-snug mb-2">
                    {produto.descricao}
                  </h3>
                  <p className="text-base font-bold text-stone-900">
                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                    <span className="text-xs font-normal text-stone-400">
                      {' / '}{produto.embalagem}
                    </span>
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAdicionar(produto);
                    }}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2
                      bg-primary hover:bg-primary-hover text-white
                      text-xs font-semibold rounded-lg transition"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
