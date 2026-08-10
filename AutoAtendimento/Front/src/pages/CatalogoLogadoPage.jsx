import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext'
import logo from '../assets/logo.jpg';

const b2bProducts = [
  // Row 1
  {
    id: 1,
    category: 'TRADICIONAL',
    name: 'Doce de Leite Pote 500g',
    packaging: [
    {
      id: "cx30",
      name: "Caixa com 30un",
      units: 30,
      price: 75.00
    }
  ],
    image: 'https://placehold.co/400x280/C2856A/FFF?text=Doce+de+Leite',
  },
  {
    id: 2,
    category: 'CLÁSSICOS',
    name: 'Goiabada Cascão 300g',
    packaging: [
    {
      id: "cx24",
      name: "Caixa com 24un",
      units: 24,
      price: 56.00
    }
  ],
    image: 'https://placehold.co/400x280/7C2D12/FFF?text=Goiabada',
  },
  {
    id: 3,
    category: 'ARTESANAL',
    name: 'Pingo de Leite Pote 400g',
    packaging: [
    {
      id: "cx20",
      name: "Caixa com 20un",
      units: 20,
      price: 64.00
    }
  ],
    image: 'https://placehold.co/400x280/D4966B/FFF?text=Pingo+de+Leite',
  },
  {
    id: 4,
    category: 'TRADICIONAL',
    name: 'Cocada Cremosa 500g',
    packaging: [
    {
      id: "cx15",
      name: "Caixa com 15un",
      units: 15,
      price: 67.50
    }
  ],
    image: 'https://placehold.co/400x280/D4B896/5C3317?text=Cocada',
  },
  // Row 2
  {
    id: 5,
    category: 'PAÇOCAS',
    name: 'Paçoca Rolha Tradicional',
    packaging: [
    {
      id: "cx30",
      name: "Caixa com 30un",
      units: 30,
      price: 72.00
    }
  ],
    image: 'https://placehold.co/400x280/C2856A/FFF?text=Paçoca+Rolha',
  },
  {
    id: 6,
    category: 'PAÇOCAS',
    name: 'Pote Rolhão Tradicional',
    packaging: [
    {
      id: "cx12",
      name: "Caixa com 12un",
      units: 12,
      price: 54.00
    }
  ],
    image: 'https://placehold.co/400x280/A0651A/FFF?text=Pote+Rolhão',
  },
  {
    id: 7,
    category: 'COCADAS',
    name: 'Cocada Branca Tradicional',
    packaging: [
    {
      id: "cx20",
      name: "Caixa com 20un",
      units: 20,
      price: 60.00
    }
  ],
    image: 'https://placehold.co/400x280/D4C8A0/5C3317?text=Cocada+Branca',
  },
  {
    id: 8,
    category: 'FRUTAS',
    name: 'Bananinha Tradicional',
    packaging: [
    {
      id: "cx24",
      name: "Caixa com 24un",
      units: 24,
      price: 48.00
    }
  ],  
    image: 'https://placehold.co/400x280/C4A820/FFF?text=Bananinha',
  },
];

export default function CatalogoLogadoPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [category, setCategory] = useState('Todos');
  const { addItem } = useCart();

function handleAdicionar(produto){

  addItem({
    id: produto.id,
    name: produto.name,
    image: produto.image, 
    qty: 1,
    packaging : produto.packaging[0],
    price: produto.packaging[0].price,
  })
};

  const categorias = [ 'Todos', 
    ...new Set(
      b2bProducts.map(product => product.category)
    )
  ];

  const filtered = b2bProducts.filter((p) => {
    const search = 
    query.toLowerCase();

    const matchesSearch = 
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search);

    const matchesCategory =
    category === 'Todos' ||
    p.category === category;

    return (
    matchesSearch &&
    matchesCategory
  );

});

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-lg bg-white
              text-stone-800 placeholder-stone-300
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
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
      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-stone-400">
          Nenhum produto encontrado para "{query}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((product) => (
        <Link
          key={product.id}
          to={`/portal/produto/${product.id}`}
          className="block"
        >
          <div
            className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                {product.category}
              </p>

              <h3 className="text-sm font-semibold text-stone-800 leading-snug mb-2">
                {product.name}
              </h3>

              <p className="text-base font-bold text-stone-900">
                R$ {product.packaging[0].price.toFixed(2)}
                <span className="text-xs font-normal text-stone-400">
                  {" "} / {product.packaging[0].name}
                </span>
              </p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  console.log("Clique no Botão")

                  const usuario = localStorage.getItem('usuario');
                  if (!usuario) {
                    navigate('/login');
                    return;
                  }

                  handleAdicionar(product);
                }}
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Adicionar
              </button>

            </div>
                
          </div>
        </Link>
))}
</div>
      )}
      </div>);
}