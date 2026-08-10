import {
  Building2,
  BadgeDollarSign,
  Headset,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import Footer from "../components/sections/Footer";
import Navbar from "../components/sections/Navbar";

const benefits = [
  {
    id: 1,
    title: "Preços Exclusivos",
    description:
      "Condições especiais para compras em atacado e pedidos recorrentes.",
    icon: <BadgeDollarSign className="w-8 h-8 text-primary" />,
  },
  {
    id: 2,
    title: "Suporte Comercial",
    description:
      "Equipe dedicada para atender sua empresa sempre que precisar.",
    icon: <Headset className="w-8 h-8 text-primary" />,
  },
  {
    id: 3,
    title: "Compra Simplificada",
    description:
      "Portal B2B com pedidos rápidos e acompanhamento completo.",
    icon: <Building2 className="w-8 h-8 text-primary" />,
  },
];

export default function SejaParceiroPage() {
  return (
    <>
      <Navbar />

      <div className="bg-stone-50">

        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 py-16">

          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <div>

              <span className="text-primary font-semibold uppercase tracking-widest">
                Portal B2B
              </span>

              <h1 className="mt-4 text-5xl font-bold text-stone-900 leading-tight">
                Seja um parceiro da
                <span className="text-primary"> A Caseira</span>
              </h1>

              <p className="mt-6 text-lg text-stone-600 leading-relaxed">
                Tenha acesso a condições comerciais diferenciadas, atendimento
                exclusivo e uma plataforma desenvolvida para facilitar suas
                compras em atacado.
              </p>

              <div className="mt-8 flex gap-4 flex-wrap">

                <Link
                  to="/cadastro"
                  className="px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition flex items-center gap-2"
                >
                  Solicitar Cadastro
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="px-8 py-3 rounded-lg border border-stone-300 hover:bg-white transition"
                >
                  Já sou parceiro
                </Link>

              </div>

            </div>

            {/* Placeholder da imagem */}
            <div className="h-[420px] rounded-2xl border-2 border-dashed border-stone-300 bg-white flex items-center justify-center">

              <div className="text-center">

                <Building2 className="w-20 h-20 text-stone-300 mx-auto" />

                <p className="mt-4 text-stone-400">
                  Placeholder da imagem institucional
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* NÚMEROS */}
        <section className="max-w-7xl mx-auto px-6 pb-12">

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-4xl font-bold text-primary">Varias</h2>
              <p className="mt-2 text-stone-500">
                Empresas Parceiras
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-4xl font-bold text-primary">20+</h2>
              <p className="mt-2 text-stone-500">
                Anos de Mercado
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <h2 className="text-4xl font-bold text-primary">100%</h2>
              <p className="mt-2 text-stone-500">
                Atendimento Especializado
              </p>
            </div>

          </div>

        </section>

        {/* COMO FUNCIONA */}
        <section className="bg-white py-16">

          <div className="max-w-5xl mx-auto px-6">

            <h2 className="text-3xl font-bold text-center mb-12">
              Como funciona?
            </h2>

            <div className="grid md:grid-cols-4 gap-8">

              {[
                "Solicite seu cadastro.",
                "Análise da empresa.",
                "Aprovação do cadastro.",
                "Comece a comprar.",
              ].map((step, index) => (

                <div
                  key={index}
                  className="text-center"
                >

                  <div className="mx-auto w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">

                    {index + 1}

                  </div>

                  <CheckCircle className="w-6 h-6 text-primary mx-auto mt-5"/>

                  <p className="mt-3 text-stone-600">
                    {step}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* BENEFÍCIOS */}
        <section className="max-w-7xl mx-auto px-6 py-16">

          <h2 className="text-3xl font-bold text-center mb-12">
            Por que escolher a A Caseira?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {benefits.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm p-8 hover:shadow-lg transition"
              >

                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">

                  {item.icon}

                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 text-stone-500 leading-relaxed">
                  {item.description}
                </p>

              </div>

            ))}

          </div>

        </section>

        {/* DIFERENCIAIS */}
        <section className="bg-white py-16">

          <div className="max-w-6xl mx-auto px-6">

            <h2 className="text-3xl font-bold text-center mb-12">
              Diferenciais
            </h2>

            <div className="grid md:grid-cols-3 gap-8">

              <div className="text-center">
                <Truck className="w-10 h-10 text-primary mx-auto"/>
                <h3 className="mt-4 font-semibold">
                  Entrega Ágil
                </h3>
                <p className="text-stone-500 mt-2">
                  Logística eficiente para todo o Brasil.
                </p>
              </div>

              <div className="text-center">
                <ShieldCheck className="w-10 h-10 text-primary mx-auto"/>
                <h3 className="mt-4 font-semibold">
                  Qualidade Garantida
                </h3>
                <p className="text-stone-500 mt-2">
                  Produtos produzidos com alto padrão de qualidade.
                </p>
              </div>

              <div className="text-center">
                <Users className="w-10 h-10 text-primary mx-auto"/>
                <h3 className="mt-4 font-semibold">
                  Atendimento Personalizado
                </h3>
                <p className="text-stone-500 mt-2">
                  Equipe preparada para atender sua empresa.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20">

          <div className="bg-primary rounded-3xl text-white text-center p-12">

            <h2 className="text-4xl font-bold">
              Pronto para fazer parte da nossa rede?
            </h2>

            <p className="mt-4 opacity-90">
              Solicite seu cadastro e aproveite todas as vantagens exclusivas
              para parceiros.
            </p>

            <Link
              to="/cadastro"
              className="inline-flex mt-8 bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-stone-100 transition"
            >
              Quero ser parceiro
            </Link>

          </div>

        </section>

      </div>

      <Footer />
    </>
  );
}