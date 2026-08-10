import { RefreshCw, Eye } from 'lucide-react';
import FeatureCard from '../ui/FeatureCard';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const features = [
  {
    icon: RefreshCw,
    title: 'Qualidade Premium',
    description:
      "Rigoroso controle de ingredientes, sem conservantes artificiais agressivos. O sabor do 'feito em casa' em escala comercial.",
  },
  {
    icon: Eye,
    title: 'Parceria B2B',
    description:
      'Logística inteligente, portal exclusivo para reposição de estoque e suporte dedicado ao sucesso do seu comércio.',
  },
];

export default function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="produtos" className="bg-gray-100 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            A excelência em cada detalhe
          </h2>
          <p className="mt-3 text-base text-gray-500 leading-relaxed max-w-xl mx-auto">
            Produtos desenvolvidos para encantar o consumidor final e oferecer a
            melhor margem e logística para o nosso parceiro B2B.
          </p>
        </div>

        {/* Content grid */}
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-start transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Featured product image with overlay */}
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="https://images.tcdn.com.br/img/img_prod/1151460/pacoca_rolha_carijos_25_2_6bd3648883c77a4f71f641bbc7ade4d6.jpg"
              alt="Paçocas artesanais empilhadas — produto carro-chefe A Caseira"
              className="w-full h-full object-cover"
            />
            {/* Carro-chefe badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                Carro-chefe
              </span>
            </div>
            {/* Bottom text overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-6">
              <h3 className="text-xl font-bold text-white">Paçocas Artesanais</h3>
              <p className="mt-1 text-sm text-gray-300 leading-relaxed">
                Nossa receita exclusiva garante a textura perfeita que derrete na
                boca. Embalagens pensadas para PDV de alto fluxo.
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="flex flex-col gap-6 lg:pt-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
