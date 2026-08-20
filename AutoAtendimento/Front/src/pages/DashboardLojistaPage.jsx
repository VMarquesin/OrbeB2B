import { useState,useEffect } from 'react';
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, ShoppingCart, CheckCircle2, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const mockUser = {
  name: 'Supermercado Dois Irmãos',
};

const mockLastOrder = {
  id: '#10492',
  date: '15/10/2023',
  status: 'Entregue',
  total: 'R$ 1.250,00',
  items: [
    '15 caixas - Paçoca Rolha Tradicional',
    '5 caixas - Cocada Branca Tradicional',
  ],
};

const b2bFeaturedProducts = [
  {
    id: 1,
    category: 'TRADICIONAL',
    name: 'Doce de Leite Pote 500g',
    guid: "doce-leite-500",

packaging: [
  {
    id: "cx30",
    name: "Caixa com 30un",
    units: 30,
    price: 75.00
  }
],
    price: 'R$ 75,00',
    image: 'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
  },
  {
    id: 2,
    category: 'CLÁSSICOS',
    name: 'Goiabada Cascão 300g',
    guid: "goiabada-cascao-300",
    packaging: [
      {
        id: "cx24",
        name: "Caixa com 24un",
        units: 24,
        price: 56.00
      }
    ],
    image: 'https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg',
  },
  {
    id: 3,
    category: 'ARTESANAL',
    name: 'Pingo de Leite Pote 400g',
    guid: "pingo-leite-400",
    packaging: [
      {
        id: "cx20",
        name: "Caixa com 20un",
        units: 20,
        price: 64.00
      }
    ],
    image: 'https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp',
  },
  {
    id: 4,
    category: 'TRADICIONAL',
    name: 'Cocada Cremosa 500g',
    guid: "cocada-cremosa-500",
    packaging: [
      {
        id: "cx15",
        name: "Caixa com 15un",
        units: 15,
        price: 67.50
      }
    ],
    image: 'https://coracaoevida.com.br/wp-content/uploads/2019/06/Imagem_pedemolequen.jpg',
  },
];

export default function DashboardLojistaPage() {

   const { addItem } = useCart();

   const [showCartMessage, setShowCartMessage] = useState(false);
   const [cartMessage, setCartMessage] = useState('');

  
   const [selectedProduct, setSelectedProduct] = useState(null);
   const [selectedPackaging, setSelectedPackaging] = useState(null);
   const [quantity, setQuantity] = useState(1);

  function handleAdicionar(produto) {
  setSelectedProduct(produto);
  setSelectedPackaging(produto.packaging[0]);
  setQuantity(1);
}

function handleCloseAddModal() {
  setSelectedProduct(null);
  setSelectedPackaging(null);
  setQuantity(1);
}

function handleConfirmAdd() {
  if (!selectedProduct || !selectedPackaging) return;

  addItem({
    id: selectedProduct.id,
    guid: selectedProduct.guid,
    name: selectedProduct.name,
    image: selectedProduct.image,
    qty: quantity,
    price: selectedPackaging.price,
    packaging: selectedPackaging,
  });

  setCartMessage(
    `${selectedProduct.name} foi adicionado ao carrinho!`
  );

  setShowCartMessage(true);

  handleCloseAddModal();

  setTimeout(() => {
    setShowCartMessage(false);
  }, 2500);
}

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
        <h1 className="text-2xl font-bold text-stone-900">
          Olá, {mockUser.name}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Aqui estão as novidades e seus pedidos recentes.
        </p>
      </div>

      {/* Last order card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-stone-800">
              Histórico de Compras
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Resumo do último pedido realizado em {mockLastOrder.date}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-100 text-sky-700 shrink-0">
            {mockLastOrder.status}
          </span>
        </div>

        <div className="border-t border-stone-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-stone-400">
              Pedido {mockLastOrder.id}
            </p>
            <ul className="mt-2 space-y-1">
              {mockLastOrder.items.map((item, i) => (
                <li key={i} className="text-sm text-stone-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-stone-900">
              {mockLastOrder.total}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Link
            to="/portal/checkout"
            className="inline-flex items-center gap-2 px-5 py-2.5
              bg-primary hover:bg-primary-hover active:scale-[0.98]
              text-white text-sm font-semibold rounded-full
              shadow-sm shadow-primary/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            Repetir Último Pedido
          </Link>
        </div>
      </div>

      {/* Featured catalog */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {b2bFeaturedProducts.map((product) => (
            <Link
              key={product.id}
              to={`/portal/produto/${product.id}`}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-36 object-cover"
              />
              <div className="p-4">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="text-sm font-semibold text-stone-800 leading-snug mb-2">
                  {product.name}
                </h3>
                <p className="text-base font-bold text-stone-900">
                  R$ {product.packaging[0].price.toFixed(2).replace(".", ",")}
                  <span className="text-xs font-normal text-stone-400">
                    {" / "}
                    {product.packaging[0].name}
                  </span>
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAdicionar(product);
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
      </div>
      {/* =========================================================
    MODAL DE CONFIGURAÇÃO DO PRODUTO
========================================================= */}

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
      pt-12
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
