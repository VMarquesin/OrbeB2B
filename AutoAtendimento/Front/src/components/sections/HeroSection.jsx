import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="inicio" className="bg-stone-50 py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Text content */}
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Tradição &amp; Qualidade
            </span>

           <h1 className="text-5xl lg:text-[64px] font-extrabold leading-[1.05] tracking-[-0.03em] text-slate-950"> 
              A tradição que seu comércio merece.
            </h1>

            <p className="text-lg text-slate-500 leading-8 max-w-xl">
              Elevamos o padrão dos doces caseiros no varejo. Nossas paçocas e
              especialidades são produzidas com ingredientes selecionados,
              garantindo giro rápido e clientes satisfeitos na sua loja.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button variant="primary" href="#catalogo">
                Conhecer Produtos <ArrowRight className="h-4 w-4" />
              </Button>
              <Link to="portal/suporte">
                <Button variant="ghost">Fale Conosco</Button>
              </Link>
            </div>
          </div>

          {/* Product image */}
          <div>
            <img
              src="https://blog.lojacocamar.com.br/wp-content/uploads/2026/04/Pacoca-caseira-facil-receita-tradicional-que-derrete-na-boca-.webp"
              alt="Paçocas artesanais A Caseira em tigela de madeira"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
