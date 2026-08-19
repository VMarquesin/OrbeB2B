import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.jpg';

const navLinks = [
  { label: 'Nossos Produtos', href: '#catalogo' },
  { label: 'Nossa História', href: '#historia' },
  { label: 'Seja um Parceiro', href: '#parceiros' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="
        sticky top-0 z-50
        bg-white/95
        backdrop-blur-md
        border-b border-stone-200/80
      "
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        <nav className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div
              className="
                h-11 w-11
                rounded-xl
                overflow-hidden
                flex items-center justify-center
                bg-stone-50
                border border-stone-200
                transition-all duration-200
                group-hover:border-primary/30
                group-hover:shadow-sm
              "
            >
              <img
                src={logo}
                alt="A Caseira"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-slate-950">
                A Caseira
              </span>

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-primary
                "
              >
                Doces & Tradição
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="
                    relative
                    text-sm
                    font-medium
                    text-slate-500
                    hover:text-slate-950
                    transition-colors
                    duration-200
                    group
                  "
                >
                  {link.label}

                  <span
                    className="
                      absolute
                      -bottom-2
                      left-0
                      h-px
                      w-0
                      bg-primary
                      transition-all
                      duration-200
                      group-hover:w-full
                    "
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <Link
            to="/login"
            className="
              hidden md:inline-flex
              items-center
              gap-2
              rounded-xl
              bg-primary
              px-5 py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              shadow-primary/20
              hover:bg-primary-hover
              hover:shadow-md
              hover:shadow-primary/20
              active:scale-[0.98]
              transition-all
              duration-200
            "
          >
            Área do Lojista

            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2}
            />
          </Link>

          {/* Mobile button */}
          <button
            className="
              md:hidden
              p-2
              rounded-lg
              text-slate-500
              hover:text-slate-950
              hover:bg-stone-100
              transition-colors
            "
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen
                ? 'Fechar menu'
                : 'Abrir menu'
            }
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="
              md:hidden
              border-t border-stone-200
              py-5
            "
          >
            <ul className="flex flex-col gap-1">

              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="
                      flex
                      items-center
                      px-3 py-3
                      rounded-lg
                      text-sm
                      font-medium
                      text-slate-600
                      hover:text-slate-950
                      hover:bg-stone-50
                      transition-colors
                    "
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              <li className="pt-3">

                <Link
                  to="/login"
                  className="
                    w-full
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary
                    px-5 py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    hover:bg-primary-hover
                    transition-all
                  "
                  onClick={() => setMenuOpen(false)}
                >
                  Área do Lojista

                  <ArrowRight className="h-4 w-4" />
                </Link>

              </li>

            </ul>
          </div>
        )}

      </div>
    </header>
  );
}