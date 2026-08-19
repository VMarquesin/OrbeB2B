import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';

import { obterProdutosPublicos } from '../../services/vitrineService';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import logo from '../../assets/logo.jpg';

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="h-48 bg-gray-200" />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between">
          <div className="h-5 w-20 rounded bg-gray-200" />
          <div className="h-4 w-10 rounded bg-gray-200" />
        </div>

        <div className="h-4 w-3/4 rounded bg-gray-200" />

        <div className="h-10 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function PublicCatalog() {
  const [products, setProducts]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro]           = useState(null);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('Todos');
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setIsLoading(true);
      setErro(null);
      try {
        const data = await obterProdutosPublicos();
        if (!cancelado) setProducts(data);
      } catch (err) {
        if (!cancelado) setErro(err.mensagemNormalizada ?? 'Erro ao carregar catálogo.');
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  // Categorias derivadas do campo embalagem
  const categories = ['Todos', ...new Set(products.map((p) => p.embalagem).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      p.descricao?.toLowerCase().includes(searchText) ||
      p.embalagem?.toLowerCase().includes(searchText) ||
      p.codigoComercial?.toLowerCase().includes(searchText);
    const matchesCategory = category === 'Todos' || p.embalagem === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <section
      id="catalogo"
      className="bg-gray-50 py-20 lg:py-28"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Cabeçalho */}
        <div
          ref={ref}
          className={`mb-12 text-center transition-all duration-700 ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <img
            src={logo}
            alt="A Caseira"
            className="mx-auto h-20 mb-6 object-contain"
          />

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Nosso Catálogo Completo
          </h2>

          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Conheça nossa linha artesanal.
            Filtre os produtos por nome ou categoria.
          </p>
        </div>

        {/* Pesquisa e filtro */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          {/* Busca */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar produto..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          {/* Categoria */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-gray-500" />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : erro ? (
            <div className="col-span-full py-20 text-center text-red-400">
              {erro}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              Nenhum produto encontrado.
            </div>
          ) : (
            filteredProducts.map((produto) => (
              <Link
                key={produto.id}
                to={`/catalogo/${produto.id}`}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <img
                  src={`https://placehold.co/400x280/C2856A/FFF?text=${encodeURIComponent((produto.descricao ?? '').slice(0, 14))}`}
                  alt={produto.descricao}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="flex flex-col flex-1 gap-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {produto.embalagem}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{produto.descricao}</h3>
                  <p className="text-xs text-gray-400">Cód. {produto.codigoComercial}</p>
                  <span className="mt-auto flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition">
                    Saiba Mais
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Banner B2B */}
        {!isLoading && (
          <div className="mt-12 rounded-2xl bg-primary-light p-8 text-center">
            <p className="font-semibold text-primary">
              Você é lojista ou distribuidor?
            </p>

            <p className="mt-2 text-gray-600">
              Acesse o Portal B2B para consultar preços,
              condições de pagamento e realizar pedidos.
            </p>

            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-hover transition"
            >
              Acessar Portal B2B

              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}