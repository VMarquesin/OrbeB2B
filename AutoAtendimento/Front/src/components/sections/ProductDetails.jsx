import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Scale,
  Package,
  Lock,
  LogIn,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X
} from 'lucide-react';
import { fetchProductById } from '../../services/apiMock';
import { useCart } from '../../contexts/CartContext';

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-16 animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-3 w-3 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left — image skeleton */}
        <div>
          <div className="rounded-2xl bg-gray-200 aspect-[4/3] w-full" />

          <div className="mt-4 flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 w-20 rounded-xl bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* Right — content skeleton */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded bg-gray-200" />
            <div className="h-8 w-1/2 rounded bg-gray-200" />
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-40 rounded-full bg-gray-200" />
            <div className="h-8 w-40 rounded-full bg-gray-200" />
          </div>

          <div className="h-px bg-gray-100" />

          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
            <div className="h-4 w-4/5 rounded bg-gray-100" />
          </div>

          <div className="rounded-2xl bg-gray-100 h-52" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound({ b2b }) {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 text-center">
      <p className="text-lg font-semibold text-gray-700">
        Produto não encontrado.
      </p>

      <Link
        to={b2b ? "/portal/catalogo" : "/catalogo"}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar ao Catálogo
      </Link>
    </div>
  );
}

export default function ProductDetails({ b2b = false }) {
  const { productId } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartMessage, setShowCartMessage] = useState(false);

  useEffect(() => {
    if (!showCartMessage) return;

    const timer = setTimeout(() => {
      setShowCartMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showCartMessage]);

  useEffect(() => {
    setIsLoading(true);

    fetchProductById(productId).then((data) => {
      setProduct(data);
      setSelectedImage(data?.images?.[0] ?? null);
      setSelectedPackaging(data?.packaging?.[0] ?? null);
      setIsLoading(false);
    });
  }, [productId]);

  function handleAddToCart() {
    if (!selectedPackaging) {
      alert("Selecione uma embalagem");
      return;
    }

    addItem({
      id: product.id,
      guid: product.guid,
      name: product.name,
      image: product.image,
      qty: quantity,
      price: selectedPackaging.price,
      packaging: {
        id: selectedPackaging.id,
        name: selectedPackaging.name,
        units: selectedPackaging.units,
        price: selectedPackaging.price,
      },
    });

    setShowCartMessage(true);
  }

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <ProductNotFound b2b={b2b} />;

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-sm text-gray-500">
          <Link
            to={b2b ? "/portal/catalogo" : "/catalogo"}
            className="hover:text-primary transition-colors"
          >
            Catálogo
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />

          <span className="text-gray-700">
            {product.category}
          </span>
        </nav>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── LEFT: Image gallery ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover transition-opacity duration-300"
              />
            </div>

            {/* Thumbnails */}
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`Ver imagem ${i + 1}`}
                  className={`rounded-xl overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedImage === img
                      ? 'border-primary'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} — vista ${i + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {product.price && (
              <p className="text-3xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(product.price)}
              </p>
            )}

            {/* Spec pills */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600">
                <Scale className="h-4 w-4 shrink-0 text-gray-400" />
                Peso líquido {product.weight}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-600">
                <Package className="h-4 w-4 shrink-0 text-gray-400" />
                {product.unitsPerBox} unidades por caixa
              </span>
            </div>

            <hr className="border-gray-100" />

            <p className="text-base text-gray-600 leading-relaxed">
              {product.fullDescription}
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  Escolha a embalagem
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Selecione a opção desejada para este produto.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.packaging?.map((pack) => {
                  const isSelected = selectedPackaging?.id === pack.id;

                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPackaging(pack)}
                      className={`
                        relative
                        text-left
                        rounded-xl
                        border
                        p-4
                        transition-all
                        duration-200
                        ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      {isSelected && (
                        <div
                          className="
                            absolute
                            top-3
                            right-3
                            flex
                            items-center
                            justify-center
                            w-5
                            h-5
                            rounded-full
                            bg-primary
                            text-white
                          "
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}

                      <p className="font-semibold text-gray-900 pr-7">
                        {pack.name}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {pack.units} unidades por caixa
                      </p>

                      <p className="text-lg font-bold text-primary mt-3">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(pack.price)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {!b2b && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border bg-white">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Preços Exclusivos para Lojistas
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Cadastre-se ou faça login com seu CNPJ para visualizar
                      preços e realizar encomendas em lote.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Faça login para ver preços e encomendar
                </Link>
              </div>
            )}

            {b2b && (
              <div className="pt-1">
                <p className="font-semibold text-gray-900">
                  Quantidade de caixas
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Escolha quantas caixas deseja adicionar ao pedido.
                </p>

                <div className="mt-3 inline-flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity === 1}
                    className="
                      w-11
                      h-11
                      flex
                      items-center
                      justify-center
                      text-lg
                      text-gray-600
                      hover:bg-gray-50
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      transition
                    "
                  >
                    −
                  </button>

                  <div
                    className="
                      w-14
                      h-11
                      flex
                      items-center
                      justify-center
                      border-x
                      border-gray-200
                      font-semibold
                      text-gray-900
                    "
                  >
                    {quantity}
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="
                      w-11
                      h-11
                      flex
                      items-center
                      justify-center
                      text-lg
                      text-gray-600
                      hover:bg-gray-50
                      transition
                    "
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {b2b && selectedPackaging && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedPackaging.name}
                  </span>

                  <span className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(selectedPackaging.price)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    Quantidade
                  </span>

                  <span className="text-sm font-medium text-gray-900">
                    {quantity} {quantity === 1 ? 'caixa' : 'caixas'}
                  </span>
                </div>

                <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    Total
                  </span>

                  <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(selectedPackaging.price * quantity)}
                  </span>
                </div>
              </div>
            )}

            {b2b && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="
                  w-full
                  h-14
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-primary
                  hover:bg-primary-hover
                  text-white
                  rounded-xl
                  font-semibold
                  shadow-sm
                  hover:shadow-md
                  transition-all
                  duration-200
                "
              >
                <Package className="w-5 h-5" />
                Adicionar ao carrinho
              </button>
            )}

            {!b2b && (
              <p className="text-center text-xs text-gray-400">
                Ainda não é parceiro?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Cadastre-se aqui.
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {showCartMessage && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-[9999]
            w-[360px]
            max-w-[calc(100vw-2rem)]
            bg-white
            border
            border-green-200
            rounded-2xl
            shadow-2xl
            p-4
            animate-in
            slide-in-from-right-5
            duration-300
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-green-50
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <CheckCircle2
                className="w-5 h-5 text-green-600"
                strokeWidth={2}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900">
                Produto adicionado!
              </p>

              <p className="text-sm text-stone-600 mt-1">
                {product.name} foi adicionado ao carrinho.
              </p>

              <p className="text-xs text-stone-400 mt-1">
                {quantity}x {selectedPackaging?.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCartMessage(false)}
              className="
                text-stone-400
                hover:text-stone-700
                transition
              "
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/portal/carrinho"
            onClick={() => setShowCartMessage(false)}
            className="
              mt-4
              w-full
              flex
              items-center
              justify-center
              bg-primary
              hover:bg-primary-hover
              text-white
              py-2.5
              rounded-xl
              text-sm
              font-semibold
              transition-all
            "
          >
            Ver carrinho
          </Link>
        </div>
      )}
    </>
  );
}