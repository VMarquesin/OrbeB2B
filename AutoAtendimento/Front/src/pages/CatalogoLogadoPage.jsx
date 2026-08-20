import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const b2bProducts = [
  // Row 1
  {
    id: 1,
    category: 'TRADICIONAL',
    name: 'Doce de Leite Pote 500g',
    packaging: [
      {
        id: 'cx30',
        name: 'Caixa com 30un',
        units: 30,
        price: 75.0,
      },
    ],
    image:
      'https://placehold.co/400x280/C2856A/FFF?text=Doce+de+Leite',
  },

  {
    id: 2,
    category: 'CLÁSSICOS',
    name: 'Goiabada Cascão 300g',
    packaging: [
      {
        id: 'cx24',
        name: 'Caixa com 24un',
        units: 24,
        price: 56.0,
      },
    ],
    image:
      'https://placehold.co/400x280/7C2D12/FFF?text=Goiabada',
  },

  {
    id: 3,
    category: 'ARTESANAL',
    name: 'Pingo de Leite Pote 400g',
    packaging: [
      {
        id: 'cx20',
        name: 'Caixa com 20un',
        units: 20,
        price: 64.0,
      },
    ],
    image:
      'https://placehold.co/400x280/D4966B/FFF?text=Pingo+de+Leite',
  },

  {
    id: 4,
    category: 'TRADICIONAL',
    name: 'Cocada Cremosa 500g',
    packaging: [
      {
        id: 'cx15',
        name: 'Caixa com 15un',
        units: 15,
        price: 67.5,
      },
      {
        id: 'cx60',
        name: 'Caixa com 60un',
        units: 15,
        price: 120,
      },

    ],
    image:
      'https://placehold.co/400x280/D4B896/5C3317?text=Cocada',
  },

  // Row 2
  {
    id: 5,
    category: 'PAÇOCAS',
    name: 'Paçoca Rolha Tradicional',
    packaging: [
      {
        id: 'cx30',
        name: 'Caixa com 30un',
        units: 30,
        price: 72.0,
      },
    ],
    image:
      'https://placehold.co/400x280/C2856A/FFF?text=Paçoca+Rolha',
  },

  {
    id: 6,
    category: 'PAÇOCAS',
    name: 'Pote Rolhão Tradicional',
    packaging: [
      {
        id: 'cx12',
        name: 'Caixa com 12un',
        units: 12,
        price: 54.0,
      },
    ],
    image:
      'https://placehold.co/400x280/A0651A/FFF?text=Pote+Rolhão',
  },

  {
    id: 7,
    category: 'COCADAS',
    name: 'Cocada Branca Tradicional',
    packaging: [
      {
        id: 'cx20',
        name: 'Caixa com 20un',
        units: 20,
        price: 60.0,
      },
    ],
    image:
      'https://placehold.co/400x280/D4C8A0/5C3317?text=Cocada+Branca',
  },

  {
    id: 8,
    category: 'FRUTAS',
    name: 'Bananinha Tradicional',
    packaging: [
      {
        id: 'cx24',
        name: 'Caixa com 24un',
        units: 24,
        price: 48.0,
      },
    ],
    image:
      'https://placehold.co/400x280/C4A820/FFF?text=Bananinha',
  },
];

export default function CatalogoLogadoPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');

  // Toast
  const [showAdded, setShowAdded] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);

  // Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPackaging, setSelectedPackaging] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  const { addItem } = useCart();

  // =========================================================
  // Esconde automaticamente o Toast depois de 3 segundos
  // =========================================================

  useEffect(() => {
    if (!showAdded) return;

    const timer = setTimeout(() => {
      setShowAdded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showAdded]);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  function handleOpenAddModal(produto) {
    setSelectedProduct(produto);

    // Seleciona a primeira embalagem automaticamente
    setSelectedPackaging(produto.packaging[0]);

    // Começa com 1 caixa
    setQuantity(1);
  }

  // =========================================================
  // FECHAR MODAL
  // =========================================================

  function handleCloseAddModal() {
    setSelectedProduct(null);
    setSelectedPackaging(null);
    setQuantity(1);
  }

  // =========================================================
  // CONFIRMAR ADIÇÃO AO CARRINHO
  // =========================================================

  function handleConfirmAdd() {
    if (!selectedProduct || !selectedPackaging) return;

    addItem({
      id: selectedProduct.id,
      guid: selectedProduct.guid || `produto-${selectedProduct.id}`,
      name: selectedProduct.name,
      image: selectedProduct.image,

      // Quantidade de caixas
      qty: quantity,

      // Embalagem selecionada
      packaging: selectedPackaging,

      // Preço por caixa
      price: selectedPackaging.price,
    });

    // Dados usados pelo Toast
    setAddedProduct({
      ...selectedProduct,
      selectedPackaging,
      quantity,
    });

    setShowAdded(true);

    // Fecha o modal
    handleCloseAddModal();
  }

  // =========================================================
  // BOTÃO ADICIONAR DO CARD
  // =========================================================

  function handleClickAdicionar(e, produto) {
    e.preventDefault();
    e.stopPropagation();

    handleOpenAddModal(produto);
  }

  // =========================================================
  // CATEGORIAS
  // =========================================================

  const categorias = [
    'Todos',
    ...new Set(b2bProducts.map((product) => product.category)),
  ];

  // =========================================================
  // FILTRO
  // =========================================================

  const filtered = b2bProducts.filter((p) => {
    const search = query.toLowerCase();

    const matchesSearch =
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search);

    const matchesCategory =
      category === 'Todos' || p.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">

      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div className="flex items-center gap-3">

        {/* Busca */}

        <div className="relative flex-1 max-w-sm">

          <Search
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              w-4
              h-4
              text-stone-400
            "
            strokeWidth={1.75}
          />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="
              w-full
              pl-9
              pr-4
              py-2.5
              text-sm
              border
              border-stone-200
              rounded-lg
              bg-white
              text-stone-800
              placeholder-stone-300
              focus:outline-none
              focus:ring-2
              focus:ring-primary/30
              focus:border-primary
              transition
            "
          />

        </div>

        {/* Filtro */}

        <div className="flex items-center gap-2">

          <SlidersHorizontal
            className="w-4 h-4 text-stone-400"
            strokeWidth={1.75}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
              px-4
              py-2.5
              text-sm
              border
              border-stone-200
              rounded-lg
              bg-white
              text-stone-600
              focus:outline-none
              focus:ring-2
              focus:ring-primary/30
            "
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* =====================================================
          PRODUTOS
      ====================================================== */}

      {filtered.length === 0 ? (

        <div className="py-20 text-center text-sm text-stone-400">
          Nenhum produto encontrado para "{query}".
        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {filtered.map((product) => {

            const isAdded =
              showAdded &&
              addedProduct?.id === product.id;

            return (

              <Link
                key={product.id}
                to={`/portal/produto/${product.id}`}
                className="block"
              >

                <div
                  className="
                    bg-white
                    rounded-xl
                    border
                    border-stone-200
                    overflow-hidden
                    shadow-sm
                    hover:shadow-md
                    transition-shadow
                  "
                >

                  {/* Imagem */}

                  <img
                    src={product.image}
                    alt={product.name}
                    className="
                      w-full
                      h-40
                      object-cover
                    "
                  />

                  {/* Conteúdo */}

                  <div className="p-4">

                    <p
                      className="
                        text-[10px]
                        font-bold
                        text-stone-400
                        uppercase
                        tracking-wider
                        mb-1
                      "
                    >
                      {product.category}
                    </p>

                    <h3
                      className="
                        text-sm
                        font-semibold
                        text-stone-800
                        leading-snug
                        mb-2
                      "
                    >
                      {product.name}
                    </h3>

                    <p className="text-base font-bold text-stone-900">

                      R$ {product.packaging[0].price.toFixed(2)}

                      <span
                        className="
                          text-xs
                          font-normal
                          text-stone-400
                        "
                      >
                        {' '}
                        / {product.packaging[0].name}
                      </span>

                    </p>

                    {/* =================================================
                        BOTÃO ADICIONAR
                    ================================================== */}

                    <button
                      type="button"
                      onClick={(e) =>
                        handleClickAdicionar(e, product)
                      }
                      className={`
                        mt-3
                        flex
                        items-center
                        justify-center
                        gap-2
                        w-full
                        py-2.5
                        text-xs
                        font-semibold
                        rounded-lg
                        transition-all
                        duration-200
                        active:scale-[0.98]
                        text-white

                        ${
                          isAdded
                            ? `
                              bg-green-600
                              hover:bg-green-700
                            `
                            : `
                              bg-primary
                              hover:bg-primary-hover
                            `
                        }
                      `}
                    >

                      {isAdded ? (
                        <>
                          <CheckCircle2
                            className="w-3.5 h-3.5"
                            strokeWidth={2.2}
                          />

                          Adicionado
                        </>
                      ) : (
                        <>
                          <ShoppingCart
                            className="w-3.5 h-3.5"
                          />

                          Adicionar
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </Link>
            );
          })}

        </div>
      )}

      {/* =========================================================
          TOAST DE PRODUTO ADICIONADO
      ========================================================== */}

      {showAdded && addedProduct && (

        <div
          className="
            fixed
            bottom-6
            right-6
            z-[100]
            w-[360px]
            max-w-[calc(100vw-2rem)]
            bg-white
            border
            border-stone-200
            rounded-2xl
            shadow-2xl
            p-4
          "
        >

          <div className="flex items-start gap-3">

            {/* Ícone */}

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

            {/* Informações */}

            <div className="flex-1 min-w-0">

              <p className="text-sm font-bold text-stone-900">
                Produto adicionado!
              </p>

              <p
                className="
                  text-sm
                  text-stone-600
                  mt-1
                  truncate
                "
              >
                {addedProduct.name}
              </p>

              <p className="text-xs text-stone-400 mt-1">
                {addedProduct.quantity}x{' '}
                {addedProduct.selectedPackaging?.name}
              </p>

            </div>

            {/* Fechar */}

            <button
              type="button"
              onClick={() => setShowAdded(false)}
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

          {/* Ver carrinho */}

          <button
            type="button"
            onClick={() => {
              setShowAdded(false);
              navigate('/portal/carrinho');
            }}
            className="
              mt-4
              w-full
              bg-primary
              hover:bg-primary-hover
              text-white
              py-2.5
              rounded-xl
              text-sm
              font-semibold
              transition-all
              duration-200
            "
          >
            Ver carrinho
          </button>

        </div>
      )}

      {/* =========================================================
          MODAL DE CONFIGURAÇÃO DO PRODUTO
      ========================================================== */}

      {selectedProduct &&
      createPortal (
  <div
  className="
    fixed
    inset-0
    z-[99999]
    flex
    items-start
    justify-center
    bg-black/50
    backdrop-blur-sm
    p-4
    pt-16
    overflow-hidden
  "

    onClick={handleCloseAddModal}
  >
    <div
      className="
        w-full
        max-w-md
        max-h-[calc(100vh-2rem)]
        bg-white
        rounded-2xl
        shadow-2xl
        overflow-hidden
        flex
        flex-col
      "
      onClick={(e) => e.stopPropagation()}
    >

      {/* CABEÇALHO */}

      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-4
          border-b
          border-stone-200
          shrink-0
        "
      >
        <div className="min-w-0 pr-3">
          <h2 className="text-lg font-bold text-stone-900">
            Adicionar produto
          </h2>

          <p className="text-xs text-stone-500 mt-1">
            Configure o produto antes de adicionar ao carrinho.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCloseAddModal}
          className="
            w-8
            h-8
            shrink-0
            flex
            items-center
            justify-center
            rounded-lg
            text-stone-400
            hover:bg-stone-100
            hover:text-stone-700
            transition
          "
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* CONTEÚDO */}

      <div className="p-5 overflow-y-auto">

        {/* PRODUTO */}

        <div className="flex items-center gap-3 mb-5">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="
              w-16
              h-16
              rounded-xl
              object-cover
              border
              border-stone-200
              shrink-0
            "
          />

          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-stone-400
              "
            >
              {selectedProduct.category}
            </p>

            <h3
              className="
                text-sm
                font-bold
                text-stone-900
                mt-1
                leading-snug
              "
            >
              {selectedProduct.name}
            </h3>
          </div>
        </div>

        {/* TIPO DE CAIXA */}

        <div className="mb-5">

          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-stone-800">
              Tipo de caixa
            </label>

            <span className="text-[11px] text-stone-400">
              Selecione uma opção
            </span>
          </div>

          <div className="space-y-2">

            {selectedProduct.packaging.map((packaging) => {
              const isSelected =
                selectedPackaging?.id === packaging.id;

              return (
                <button
                  key={packaging.id}
                  type="button"
                  onClick={() => {
                    setSelectedPackaging(packaging);
                    setQuantity(1);
                  }}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    rounded-xl
                    border
                    text-left
                    transition-all

                    ${
                      isSelected
                        ? `
                          border-primary
                          bg-primary/5
                          ring-1
                          ring-primary
                        `
                        : `
                          border-stone-200
                          hover:border-stone-300
                          hover:bg-stone-50
                        `
                    }
                  `}
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div
                      className={`
                        w-5
                        h-5
                        rounded-full
                        border
                        flex
                        items-center
                        justify-center
                        shrink-0

                        ${
                          isSelected
                            ? 'border-primary'
                            : 'border-stone-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <div
                          className="
                            w-2.5
                            h-2.5
                            rounded-full
                            bg-primary
                          "
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800">
                        {packaging.name}
                      </p>

                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {packaging.units} unidades por caixa
                      </p>
                    </div>

                  </div>

                  <p className="text-sm font-bold text-stone-900 shrink-0">
                    R$ {packaging.price.toFixed(2)}
                  </p>

                </button>
              );
            })}

          </div>
        </div>

        {/* QUANTIDADE */}

        <div className="mb-5">

          <label className="block text-sm font-semibold text-stone-800 mb-2">
            Quantidade de caixas
          </label>

          <div
            className="
              flex
              items-center
              justify-between
              border
              border-stone-200
              rounded-xl
              p-1.5
            "
          >

            <button
              type="button"
              onClick={() =>
                setQuantity((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={quantity === 1}
              className="
                w-10
                h-10
                rounded-lg
                flex
                items-center
                justify-center
                text-lg
                font-semibold
                text-stone-700
                hover:bg-stone-100
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition
              "
            >
              −
            </button>

            <div className="text-center">
              <p className="text-lg font-bold text-stone-900">
                {quantity}
              </p>

              <p className="text-[11px] text-stone-400">
                {quantity === 1 ? 'caixa' : 'caixas'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setQuantity((current) => current + 1)
              }
              className="
                w-10
                h-10
                rounded-lg
                flex
                items-center
                justify-center
                text-lg
                font-semibold
                text-stone-700
                hover:bg-stone-100
                transition
              "
            >
              +
            </button>

          </div>
        </div>

        {/* RESUMO */}

        {selectedPackaging && (
          <div
            className="
              bg-stone-50
              border
              border-stone-200
              rounded-xl
              p-3
              mb-5
            "
          >

            <div className="flex justify-between text-sm">
              <span className="text-stone-500">
                {quantity}x {selectedPackaging.name}
              </span>

              <span className="font-semibold text-stone-800">
                R$ {(selectedPackaging.price * quantity).toFixed(2)}
              </span>
            </div>

            <div
              className="
                flex
                justify-between
                mt-2
                pt-2
                border-t
                border-stone-200
              "
            >
              <span className="text-sm font-semibold text-stone-700">
                Total
              </span>

              <span className="text-base font-bold text-stone-900">
                R$ {(selectedPackaging.price * quantity).toFixed(2)}
              </span>
            </div>

          </div>
        )}

        {/* BOTÕES */}

        <div className="flex gap-3">

          <button
            type="button"
            onClick={handleCloseAddModal}
            className="
              flex-1
              py-2.5
              rounded-xl
              border
              border-stone-200
              text-sm
              font-semibold
              text-stone-600
              hover:bg-stone-50
              transition
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmAdd}
            disabled={!selectedPackaging}
            className="
              flex-[1.5]
              flex
              items-center
              justify-center
              gap-2
              py-2.5
              rounded-xl
              bg-primary
              hover:bg-primary-hover
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-white
              text-sm
              font-semibold
              transition
            "
          >
            <ShoppingCart className="w-4 h-4" />

            Adicionar ao carrinho
          </button>

        </div>

      </div>

    </div>
  </div>,
  document.body
)}

    </div>
  );
}