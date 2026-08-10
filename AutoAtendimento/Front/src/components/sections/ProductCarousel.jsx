import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../../services/apiMock';
import ProductCard from '../ui/ProductCard';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AUTO_ADVANCE_MS = 3500;
const TRANSITION_MS = 500;

function CarouselItemSkeleton() {
  return (
    <div className="min-w-[240px] sm:min-w-[260px] shrink-0 animate-pulse rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="h-44 bg-gray-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between">
          <div className="h-5 w-20 rounded-full bg-gray-200" />
          <div className="h-4 w-10 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-10 rounded-full bg-gray-100 mt-1" />
      </div>
    </div>
  );
}

function ArrowButton({ onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-primary hover:border-primary hover:shadow-md transition-all duration-200"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef(null);
  const cardWidthRef = useRef(0);
  const isScrollingRef = useRef(false);
  const { ref, isVisible } = useScrollAnimation();

  // Tripla o array: cópia anterior | cópia real | cópia seguinte
  // Garante que sempre há espaço para deslizar em ambas as direções
  const tripled = useMemo(() => [...products, ...products, ...products], [products]);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data.slice(0, 6));
      setIsLoading(false);
    });
  }, []);

  // Mede a largura de um card + gap e inicializa o scroll na cópia do meio
  useEffect(() => {
    if (isLoading || products.length === 0) return;
    requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track || track.children.length === 0) return;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
      cardWidthRef.current = track.children[0].offsetWidth + gap;
      track.scrollLeft = products.length * cardWidthRef.current;
    });
  }, [isLoading, products.length]);

  // Reposiciona silenciosamente para a cópia do meio após cada animação,
  // garantindo loop infinito sem salto visual
  const normalizeScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || !cardWidthRef.current || !products.length) return;
    const oneSetWidth = products.length * cardWidthRef.current;
    if (track.scrollLeft >= 2 * oneSetWidth) {
      track.scrollLeft -= oneSetWidth;
    } else if (track.scrollLeft < oneSetWidth) {
      track.scrollLeft += oneSetWidth;
    }
  }, [products.length]);

  const scrollByCard = useCallback(
    (direction) => {
      if (isScrollingRef.current) return;
      const track = trackRef.current;
      if (!track || !cardWidthRef.current) return;

      isScrollingRef.current = true;
      track.scrollTo({
        left: track.scrollLeft + direction * cardWidthRef.current,
        behavior: 'smooth',
      });

      setTimeout(() => {
        normalizeScroll();
        isScrollingRef.current = false;
      }, TRANSITION_MS + 50);
    },
    [normalizeScroll],
  );

  const handleNext = useCallback(() => scrollByCard(1), [scrollByCard]);
  const handlePrev = useCallback(() => scrollByCard(-1), [scrollByCard]);

  // Auto-scroll — pausa quando o mouse está sobre o carrossel
  useEffect(() => {
    if (isLoading || isHovered || !products.length) return;
    const id = setInterval(handleNext, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [isLoading, isHovered, products.length, handleNext]);

  return (
    <section id="catalogo" className="bg-white py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div
          ref={ref}
          className={`mb-10 flex items-end justify-between transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Catálogo
            </span>
            <h2 className="mt-2 text-3xl lg:text-4xl font-bold text-gray-900">
              Conheça Nossa Linha
            </h2>
          </div>
          <Link
            to="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!isLoading && (
            <ArrowButton onClick={handlePrev} icon={ChevronLeft} label="Produto anterior" />
          )}

          <div
            ref={trackRef}
            className="flex-1 flex gap-5 overflow-x-auto scrollbar-hide pb-2"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CarouselItemSkeleton key={i} />)
              : tripled.map((product, i) => (
                  <div
                    key={`${product.id}-${i}`}
                    className="min-w-[240px] sm:min-w-[260px] shrink-0"
                  >
                    <ProductCard {...product}
                    linkTo={`/catalogo/${product.id}`} />
                  </div>
                ))}
          </div>

          {!isLoading && (
            <ArrowButton onClick={handleNext} icon={ChevronRight} label="Próximo produto" />
          )}
        </div>

        {/* CTA principal */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-primary-hover hover:shadow-lg transition-all duration-200"
          >
            Ver Catálogo Completo
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
