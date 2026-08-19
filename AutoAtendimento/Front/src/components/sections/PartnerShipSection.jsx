import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import useScrollAnimation from "../../hooks/useScrollAnimation";

export default function PartnershipSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section
      id="parceiros"
      className="bg-[#FFF8F3] py-20 lg:py-28"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center transition-all duration-700 ease-out ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >

          {/* =========================
              TEXTO
          ========================== */}
          <div className="flex flex-col gap-6">

            {/* Eyebrow */}
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <span className="h-0.5 w-7 bg-primary rounded-full" />
              Seja um parceiro
            </span>

            {/* Título */}
            <h2 className="text-3xl lg:text-4xl xl:text-[42px] font-extrabold leading-tight tracking-tight text-stone-900">
              Faça parte da rede de parceiros da A Caseira.
            </h2>

            {/* Texto */}
            <div className="space-y-4">
              <p className="text-base text-stone-500 leading-relaxed">
                Há mais de duas décadas levamos sabor, qualidade e tradição
                aos consumidores brasileiros. Agora queremos levar esse
                sucesso para o seu negócio.
              </p>

              <p className="text-base text-stone-500 leading-relaxed">
                Seja você uma padaria, cafeteria, supermercado, empório ou
                loja especializada, oferecemos um portfólio completo de
                doces artesanais, suporte comercial e uma parceria construída
                para gerar resultados.
              </p>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">

              <div className="flex items-center gap-3 rounded-xl bg-white/70 border border-stone-200/70 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />

                <p className="text-sm font-medium text-stone-700">
                  Produtos de alta qualidade
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/70 border border-stone-200/70 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />

                <p className="text-sm font-medium text-stone-700">
                  Entrega eficiente
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/70 border border-stone-200/70 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />

                <p className="text-sm font-medium text-stone-700">
                  Excelente margem de revenda
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/70 border border-stone-200/70 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />

                <p className="text-sm font-medium text-stone-700">
                  Atendimento especializado
                </p>
              </div>

            </div>

            {/* CTA */}
            <div className="pt-3">

              <Link
                to="/seja-parceiro"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
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
                Quero ser parceiro

                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>
          </div>


          {/* =========================
              IMAGEM
          ========================== */}
          <div className="relative">

            {/* Moldura decorativa */}
            <div
              className="
                absolute
                -inset-3
                rounded-[2rem]
                bg-primary/10
              "
            />

            {/* Imagem */}
            <div
              className="
                relative
                h-[420px]
                lg:h-[500px]
                overflow-hidden
                rounded-[2rem]
                bg-stone-200
                shadow-xl
              "
            >

              {!imageLoaded && (
                <div className="absolute inset-0 bg-stone-200 animate-pulse" />
              )}

              <img
                src="https://images.openai.com/static-rsc-4/fmcR6tyCe0KvL1EsWuxP4lIxbkG8n3oJFhdJjNKXcviCHRC-bJHal-CJT-cl4gN3n4GWiNiP9wq7CBVdEWqY3JkyH65-dwFO0QWCsLl1sL5tKexm4N89FZ-7S8OGHAoHV6DcSfjfvLtbQ6UK1Q7kFmfcEVzLW1t6PZezse0hFrxAoi6M5_gMqsJwzXhCZ0cD?purpose=fullsize"
                alt="Parceiros A Caseira"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                className={`
                  w-full
                  h-full
                  object-cover
                  transition-all
                  duration-700
                  ${
                    imageLoaded
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  }
                `}
              />

              {/* Card sobre a imagem */}
              <div className="absolute bottom-5 left-5 right-5">

                <div
                  className="
                    rounded-2xl
                    bg-white/95
                    backdrop-blur-md
                    border
                    border-white/60
                    px-5
                    py-4
                    shadow-lg
                  "
                >

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    A Caseira
                  </p>

                  <p className="mt-1 text-sm font-semibold text-stone-900">
                    Uma parceria construída para crescer junto com o seu negócio.
                  </p>

                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
} 