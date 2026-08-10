import { Link } from 'react-router-dom';
import { RotateCcw, ArrowRight, ShoppingCart } from 'lucide-react';
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

  function handleAdicionar(produto) {
    addItem({
      id: produto.id,
      guid: produto.guid,
      name: produto.name,
      image: produto.image,
      qty: 1,
      price: produto.packaging[0].price,
      packaging: produto.packaging[0]
    });
  }

  return (
    <div className="space-y-10">
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
    </div>
  );
}
