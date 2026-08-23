import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, Lock, LogIn, ChevronRight, ChevronLeft, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { obterProdutoPorId } from '../../services/vitrineService';
import { useCart } from '../../contexts/CartContext';

// ─── Skeleton de carregamento ───────────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-16 animate-pulse">
      <div className="mb-8 flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-3 w-3 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div>
          <div className="rounded-2xl bg-gray-200 aspect-[4/3] w-full" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded bg-gray-200" />
            <div className="h-8 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="h-px bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
          </div>
          <div className="rounded-2xl bg-gray-100 h-40" />
        </div>
      </div>
    </div>
  );
}

// ─── Estado de erro ─────────────────────────────────────────────────────────
function ProductNotFound({ mensagem, backTo }) {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-lg font-semibold text-gray-700">
        {mensagem ?? 'Produto não encontrado.'}
      </p>
      <Link
        to={backTo ?? '/portal/catalogo'}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar ao Catálogo
      </Link>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ProductDetails({ b2b = false }) {
  // Suporta tanto /portal/produto/:id (b2b) quanto /catalogo/:productId (público)
  const params = useParams();
  const produtoId = params.id ?? params.productId;
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [produto, setProduto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    if (!produtoId) return;
    let cancelado = false;

    async function carregar() {
      setIsLoading(true);
      setErro(null);
      try {
        const data = await obterProdutoPorId(produtoId);
        if (!cancelado) setProduto(data);
      } catch (err) {
        if (!cancelado) setErro(err.mensagemNormalizada ?? 'Produto não encontrado.');
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, [produtoId]);

  function handleAddToCart() {
    if (!produto) return;

    addItem({
      id: produto.id,           // UUID real — garante integridade no checkout
      name: produto.descricao,
      image: produtoImagem(produto.descricao),
      qty: quantity,
      price: produto.preco,
      packaging: {
        id: 'un',
        name: produto.embalagem,
        units: 1,
      },
    });

    // Feedback visual temporário
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1800);
  }

  if (isLoading) return <ProductDetailSkeleton />;
  if (erro || !produto) return <ProductNotFound mensagem={erro} backTo={b2b ? '/portal/catalogo' : '/catalogo'} />;

  const imagemPrincipal = produtoImagem(produto.descricao);

  return (
    <section className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-gray-500">
        <Link
          to={b2b ? '/portal/catalogo' : '/catalogo'}
          className="hover:text-primary transition-colors"
        >
          Catálogo
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
        <span className="text-gray-700">{produto.embalagem}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{produto.descricao}</span>
      </nav>

      {/* Layout duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        {/* ── Imagem ── */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
            <img
              src={imagemPrincipal}
              alt={produto.descricao}
              className="w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>

        {/* ── Informações ── */}
        <div className="flex flex-col gap-6">
          {/* Código */}
          <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">
            Cód. {produto.codigoComercial}
          </p>

          {/* Nome */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            {produto.descricao}
          </h1>

          {/* Preço (só visível para B2B logado) */}
          {b2b && (
            <p className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
              <span className="text-base font-normal text-stone-400 ml-2">/ {produto.embalagem}</span>
            </p>
          )}

          {/* Spec pill */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600">
              <Package className="h-4 w-4 shrink-0 text-gray-400" />
              {produto.embalagem}
            </span>
          </div>

          <hr className="border-gray-100" />

          {/* CTA para usuário não-logado */}
          {!b2b && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border bg-white">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Preços Exclusivos para Lojistas</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Cadastre-se ou faça login com seu CNPJ para visualizar preços e realizar encomendas em lote.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-white font-semibold"
              >
                <LogIn className="h-4 w-4" />
                Faça login para ver preços e encomendar
              </Link>
              <p className="text-center text-xs text-gray-400">
                Ainda não é parceiro?{' '}
                <Link to="/seja-parceiro" className="font-medium text-primary hover:underline">
                  Cadastre-se aqui.
                </Link>
              </p>
            </div>
          )}

          {/* Controles de quantidade + botão (só B2B logado) */}
          {b2b && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-stone-700">Quantidade:</p>
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                  <button
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 transition text-lg leading-none"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-stone-800 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 transition text-lg leading-none"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-sm transition-all ${adicionado
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/25'
                  }`}
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                {adicionado ? 'Adicionado ao carrinho ✓' : 'Adicionar ao carrinho'}
              </button>

              <button
                onClick={() => { handleAddToCart(); navigate('/portal/carrinho'); }}
                className="w-full border-2 border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl py-3 font-semibold text-sm transition"
              >
                Comprar agora →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Gera placeholder consistente a partir do nome do produto
function produtoImagem(descricao) {
  return `https://placehold.co/800x600/C2856A/FFF?text=${encodeURIComponent(
    (descricao ?? 'Produto').slice(0, 16)
  )}`;
}
