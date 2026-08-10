import { Link } from "react-router-dom";
import {useState, useEffect} from 'react';  
import useScrollAnimation from '../../hooks/useScrollAnimation';

const stats = [

];

export default function PartnershipSection() {
  const {ref, isVisible} = useScrollAnimation();
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <section id="parceiros" className="bg-[#FFF8F3] py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Texto */}
          <div className="flex flex-col gap-6">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="inline-block h-0.5 w-6 bg-primary" />
              Seja um Parceiro
            </span>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Faça parte da rede de parceiros da A Caseira.
            </h2>

            <p className="text-base text-gray-500 leading-relaxed">
              Há mais de duas décadas levamos sabor, qualidade e tradição aos
              consumidores brasileiros. Agora queremos levar esse sucesso para o
              seu negócio.
            </p>

            <p className="text-base text-gray-500 leading-relaxed">
              Seja você uma padaria, cafeteria, supermercado, empório ou loja
              especializada, oferecemos um portfólio completo de doces
              artesanais, suporte comercial e uma parceria construída para gerar
              resultados.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✔</span>
                <p className="text-gray-600">Produtos de alta qualidade</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✔</span>
                <p className="text-gray-600">Entrega Eficientes</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✔</span>
                <p className="text-gray-600">Excelente margem de revenda</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✔</span>
                <p className="text-gray-600">Atendimento especializado</p>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-extrabold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                  to="/seja-parceiro"
                  className="inline-flex items-center rounded-xl bg-primary px-8 py-4 font-semibold text-white transition hover:opacity-90"
                >
                Quero ser parceiro
              </Link>
            </div>
          </div>

          {/* Imagem */}
          <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-xl bg-stone-200">

            {!imageLoaded && (
              <div className="absolute inset-0 bg-stone-200 animate-pulse" />
            )}

            <img
              src="/images/parceiros.jpg"
              alt="Parceiros A Caseira"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />

          </div>
        </div>
      </div>
    </section>
  );
}