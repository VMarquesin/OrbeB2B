import useScrollAnimation from '../../hooks/useScrollAnimation';

const stats = [
  { value: '+20', label: 'Anos de Tradição' },
  { value: '+5k', label: 'PDVs Parceiros' },
];

export default function HistorySection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="historia" className="bg-white py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Factory image */}
          <div>
            <img
              src="https://img.freepik.com/foto-premium/fabbrica-di-caramelle-industriali-dolci-industria-alimentare-dei-dessert-produzione-manifatturiera-di-cioccolato-ai-generativa_163305-185256.jpg"
              alt="Equipe de produção na fábrica A Caseira"
              className="w-full h-auto rounded-2xl object-cover"
            />
          </div>

          {/* Text content */}
          <div className="flex flex-col gap-6">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="inline-block h-0.5 w-6 bg-primary" />
              Nossa História
            </span>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Do afeto familiar para as prateleiras do Brasil.
            </h2>

            <p className="text-base text-gray-500 leading-relaxed">
              A Caseira nasceu com um propósito simples: preservar a autenticidade
              dos doces tradicionais brasileiros enquanto construía um modelo de
              negócios robusto para atender o varejo com excelência.
            </p>

            <p className="text-base text-gray-500 leading-relaxed">
              O que começou como uma pequena produção focada na qualidade absoluta
              dos ingredientes, hoje é uma operação logística e industrial
              preparada para abastecer desde empórios locais até grandes redes
              supermercadistas, sempre mantendo a essência acolhedora que dá nome
              à nossa marca.
            </p>

            <hr className="border-gray-200" />

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-extrabold text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
