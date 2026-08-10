import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wheat, ArrowRight, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Nossos Produtos', href: '#catalogo' },
  { label: 'Nossa História', href: '#historia' },
  { label: 'Seja um Parceiro', href: '#parceiros' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Wheat className="h-6 w-6 text-primary" />
            <span className="text-base font-bold text-gray-900">A Caseira</span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <Link
            to="/login"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Área do Lojista
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 pb-5">
            <ul className="flex flex-col gap-5 pt-5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
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
