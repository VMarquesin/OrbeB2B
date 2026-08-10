import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';

import { fetchProducts } from '../../services/apiMock';
import ProductCard from '../ui/ProductCard';
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
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pesquisa
  const [search, setSearch] = useState('');

  // Categoria selecionada
  const [category, setCategory] = useState('Todos');

  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    fetchProducts().then((data) => {
      console.log(data);

      setProducts(data);
      setIsLoading(false);
    });
  }, []);

  // Cria as categorias automaticamente
  const categories = [
    'Todos',
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // Filtro dos produtos
  const filteredProducts = products.filter((product) => {
    const name = product.name?.toLowerCase() || '';
    const type = product.category?.toLowerCase() || '';
    const searchText = search.toLowerCase();

    const matchesSearch =
      name.includes(searchText) ||
      type.includes(searchText);

    const matchesCategory =
      category === 'Todos' ||
      product.category === category;

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
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              Nenhum produto encontrado.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                linkTo={`/catalogo/${product.id}`}
              />
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