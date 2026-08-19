import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingCart, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import logo from '../assets/logo.jpg';
import { obterProdutos } from '../services/vitrineService';

export default function CatalogoLogadoPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');

  const [showAdded, setShowAdded] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const navigate = useNavigate();

  const { cartItems, addItem } = useCart();

  // Carrega os produtos da API ao montar o componente
  useEffect(() => {
    let cancelado = false;

    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const data = await obterProdutos();
        if (!cancelado) setProdutos(data);
      } catch (err) {
        if (!cancelado) setErro(err.mensagemNormalizada ?? 'Não foi possível carregar o catálogo.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, []);

  function handleAdicionar(produto) {
    addItem({
      id: produto.id,
      name: produto.descricao,
      image: `https://placehold.co/400x280/C2856A/FFF?text=${encodeURIComponent(produto.descricao.slice(0, 15))}`,
      qty: 1,
      packaging: { id: 'un', name: produto.embalagem, units: 1 },
      price: produto.preco,
    });
  }

  function handleClickAdicionar(e, produto) {
    e.preventDefault();
    e.stopPropagation();
    handleAdicionar(produto);
    setAddedProduct({
      id: produto.id,
      name: produto.descricao,
      packaging: [{ name: produto.embalagem }]
    });
    setShowAdded(true);
  }

  // Categorias derivadas dos dados da API (embalagem como agrupador visual)
  const categorias = ['Todos', ...new Set(produtos.map((p) => p.embalagem))];

  const filtered = produtos.filter((p) => {
    const search = query.toLowerCase();
    const matchesSearch =
      p.descricao.toLowerCase().includes(search) ||
      p.codigoComercial.toLowerCase().includes(search);
    const matchesCategory = category === 'Todos' || p.embalagem === category;
    return matchesSearch && matchesCategory;
  });

  // --- Estados de Loading e Erro ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Carregando catálogo...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-500">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-medium">{erro}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-primary underline hover:text-primary-hover"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

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
            const isAdded = cartItems?.some((item) => item.id === product.id);

            return (
              <Link
                key={product.id}
                to={`/portal/produto/${product.id}`}
                className="block"
              >
              <div
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={`https://placehold.co/400x280/C2856A/FFF?text=${encodeURIComponent(product.descricao.slice(0, 15))}`}
                  alt={product.descricao}
                  className="w-full h-40 object-cover"
                />

                <div className="p-4">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                    {product.embalagem}
                  </p>

                  <h3 className="text-sm font-semibold text-stone-800 leading-snug mb-2">
                    {product.descricao}
                  </h3>

                  <p className="text-base font-bold text-stone-900">
                    R$ {Number(product.preco).toFixed(2)}
                    <span className="text-xs font-normal text-stone-400">
                      {' '} / {product.embalagem}
                    </span>
                  </p>

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

                        ${isAdded
                        ? `
                              bg-green-600
                              hover:bg-green-700
                            `
                        : `
                              bg-primary
                              hover:bg-primary-hover
                            `
                      }

                        text-white
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

          {/* Cabeçalho */}

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

              <p
                className="
                  text-sm
                  font-bold
                  text-stone-900
                "
              >
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

              <p
                className="
                  text-xs
                  text-stone-400
                  mt-1
                "
              >
                {addedProduct.packaging?.[0]?.name}
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

          {/* Botão ver carrinho */}

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

    </div>
  );
}