import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import useScrollAnimation from '../../hooks/useScrollAnimation';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="inicio" className="bg-white py-20 lg:py-28">
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

            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-gray-900">
              A tradição que seu comércio merece.
            </h1>

            <p className="text-base text-gray-500 leading-relaxed max-w-md">
              Elevamos o padrão dos doces caseiros no varejo. Nossas paçocas e
              especialidades são produzidas com ingredientes selecionados,
              garantindo giro rápido e clientes satisfeitos na sua loja.
            </p>

            <div className="flex flex-wrap gap-4">
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
