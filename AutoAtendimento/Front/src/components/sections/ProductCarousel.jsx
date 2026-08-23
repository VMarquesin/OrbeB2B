import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { obterProdutosPublicos } from '../../services/vitrineService';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AUTO_ADVANCE_MS = 3500;
const TRANSITION_MS = 500;

function CarouselItemSkeleton() {
  return (
    <div
      className="
        min-w-[240px]
        sm:min-w-[260px]
        shrink-0
        overflow-hidden
        rounded-2xl
        border
        border-stone-200
        bg-white
        shadow-sm
        animate-pulse
      "
    >
      <div className="h-44 bg-stone-200" />

      <div className="flex flex-col gap-3 p-5">
        <div className="flex justify-between">
          <div className="h-5 w-20 rounded-full bg-stone-200" />
          <div className="h-4 w-10 rounded bg-stone-200" />
        </div>

        <div className="h-4 w-3/4 rounded bg-stone-200" />

        <div className="mt-1 h-10 rounded-xl bg-stone-100" />
      </div>
    </div>
  );
}

// Card inline — não depende do ProductCard com shape antigo
function ProdutoCarouselCard({ produto }) {
  return (
    <Link
      to={`/catalogo/${produto.id}`}
      className="flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <img
        src={`https://placehold.co/400x280/C2856A/FFF?text=${encodeURIComponent((produto.descricao ?? '').slice(0, 14))}`}
        alt={produto.descricao}
        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
      />
      <div className="flex flex-col flex-1 gap-1 p-4">
        <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{produto.embalagem}</p>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{produto.descricao}</h3>
        <span className="mt-3 flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition">
          Saiba Mais
        </span>
      </div>
    </Link>
  );
}

function ArrowButton({ onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="
        shrink-0
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-stone-200
        bg-white
        text-stone-500
        shadow-sm
        transition-all
        duration-200
        hover:border-primary
        hover:bg-primary
        hover:text-white
        hover:shadow-md
        active:scale-95
      "
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

  const tripled = useMemo(() => [...products, ...products, ...products], [products]);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const data = await obterProdutosPublicos();
        if (!cancelado) setProducts(data.slice(0, 6));
      } catch {
        // Silencioso — o carrossel da Home não deve quebrar a landing page
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (isLoading || products.length === 0) return;

    requestAnimationFrame(() => {
      const track = trackRef.current;

      if (!track || track.children.length === 0) return;

      const gap =
        parseFloat(window.getComputedStyle(track).gap) || 20;

      cardWidthRef.current =
        track.children[0].offsetWidth + gap;

      track.scrollLeft =
        products.length * cardWidthRef.current;
    });
  }, [isLoading, products.length]);

  const normalizeScroll = useCallback(() => {
    const track = trackRef.current;

    if (
      !track ||
      !cardWidthRef.current ||
      !products.length
    ) {
      return;
    }

    const oneSetWidth =
      products.length * cardWidthRef.current;

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
        left:
          track.scrollLeft +
          direction * cardWidthRef.current,
        behavior: 'smooth',
      });

      setTimeout(() => {
        normalizeScroll();
        isScrollingRef.current = false;
      }, TRANSITION_MS + 50);
    },
    [normalizeScroll]
  );

  const handleNext = useCallback(
    () => scrollByCard(1),
    [scrollByCard]
  );

  const handlePrev = useCallback(
    () => scrollByCard(-1),
    [scrollByCard]
  );

  useEffect(() => {
    if (
      isLoading ||
      isHovered ||
      !products.length
    ) {
      return;
    }

    const id = setInterval(
      handleNext,
      AUTO_ADVANCE_MS
    );

    return () => clearInterval(id);
  }, [
    isLoading,
    isHovered,
    products.length,
    handleNext,
  ]);

  return (
    <section
      id="catalogo"
      className="bg-white py-20 lg:py-28"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* =========================
            CABEÇALHO
        ========================== */}
        <div
          ref={ref}
          className={`
            mb-10
            flex
            items-end
            justify-between
            gap-6
            transition-all
            duration-700
            ease-out
            ${isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
            }
          `}
        >
          <div>

            <span
              className="
                flex
                items-center
                gap-2
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-primary
              "
            >
              <span className="h-0.5 w-7 rounded-full bg-primary" />

              Catálogo
            </span>

            <h2
              className="
                mt-3
                text-3xl
                font-extrabold
                tracking-tight
                text-stone-900
                lg:text-4xl
              "
            >
              Conheça nossa linha
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-500">
              Produtos desenvolvidos para levar qualidade,
              tradição e sabor ao seu ponto de venda.
            </p>

          </div>

          <Link
            to="/catalogo"
            className="
              hidden
              sm:inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-stone-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-stone-700
              shadow-sm
              transition-all
              hover:border-primary
              hover:bg-primary/5
              hover:text-primary
            "
          >
            Ver todos

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>


        {/* =========================
            CARROSSEL
        ========================== */}
        <div
          className="
            rounded-[2rem]
            bg-stone-50
            border
            border-stone-200/80
            p-4
            sm:p-5
            lg:p-6
          "
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >

          <div className="flex items-center gap-3">

            {!isLoading && (
              <ArrowButton
                onClick={handlePrev}
                icon={ChevronLeft}
                label="Produto anterior"
              />
            )}

            <div
              ref={trackRef}
              className="flex-1 flex gap-5 overflow-x-auto scrollbar-hide pb-2"
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <CarouselItemSkeleton key={i} />)
                : tripled.map((produto, i) => (
                  <div
                    key={`${produto.id}-${i}`}
                    className="min-w-[240px] sm:min-w-[260px] shrink-0"
                  >
                    <ProdutoCarouselCard produto={produto} />
                  </div>
                ))}
            </div>

            {!isLoading && (
              <ArrowButton
                onClick={handleNext}
                icon={ChevronRight}
                label="Próximo produto"
              />
            )}

          </div>
        </div>


        {/* =========================
            CTA
        ========================== */}
        <div className="mt-10 flex justify-center">

          <Link
            to="/catalogo"
            className="
              inline-flex
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-primary
              px-7
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-primary/20
              transition-all
              duration-200
              hover:bg-primary-hover
              hover:-translate-y-0.5
              hover:shadow-xl
              active:translate-y-0
            "
          >
            Ver catálogo completo

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

      </div>
    </section>
  );
}