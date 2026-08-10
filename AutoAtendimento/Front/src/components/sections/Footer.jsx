import { Link } from 'react-router-dom';
import { Wheat, ArrowRight, Mail, Phone } from 'lucide-react';

const empresaLinks = [
  { label: 'Sobre Nós', href: '#historia' },
  { label: 'Catálogo de Produtos', href: '#catalogo' },
  { label: 'Seja um Distribuidor', href: '#parceiros' },
];
const contatoLinks = [
  { label: 'Fale Conosco', href: '#area-lojista' },
  { label: 'Suporte ao Lojista', href: '#area-lojista' },
];

export default function Footer() {
  return (
    <footer id="area-lojista" className="bg-slate-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand — spans 2 columns */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <a href="#inicio" className="flex items-center gap-2 w-fit">
              <Wheat className="h-6 w-6 text-primary" />
              <span className="text-base font-bold text-white">A Caseira</span>
            </a>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              A tradição que seu comércio merece. Doces caseiros de alta
              qualidade para impulsionar suas vendas.
            </p>
            <Link to="/login" className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors">
              Acessar Portal B2B
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Empresa */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Empresa
            </h4>
            <ul className="flex flex-col gap-3">
              {empresaLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Contato
            </h4>
            <ul className="flex flex-col gap-3">
              {contatoLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>



        {/* Bottom bar */}
        <div className="mt-14 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} A Caseira. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:contato@acaseira.com.br"
              aria-label="Enviar e-mail"
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="tel:+5500000000000"
              aria-label="Ligar"
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
