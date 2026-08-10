import { Link } from 'react-router-dom';
import { Currency, Lock } from 'lucide-react';

export default function ProductCard({ name, category, price, description, packLabel, weight, image, badge, linkTo }) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Product image with optional badge overlay */}
      <div className="relative overflow-hidden">
        {linkTo ? (
          <Link to={linkTo} className="block">
            <img
              src={image}
              alt={name}
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        ) : (
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          />
        )}
        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 gap-2 p-4">
        {linkTo ? (
          <Link
            to={linkTo}
            className="text-base font-semibold text-gray-900 leading-snug hover:text-primary transition-colors"
          >
            {name}
          </Link>
        ) : (
          <h3 className="text-base font-semibold text-gray-900 leading-snug">{name}</h3>
        )}

        <p className="text-xs font-medium text-primary">
          {packLabel ?? `${category} · ${weight}`}
        </p>

        <p className="flex-1 text-xs text-gray-500 leading-relaxed">{description}</p>

        {price && (<p className="mt-2 text-lg font-bold text-primary">
          {new Intl.NumberFormat('pt-BR', {
            style:'currency',
            currency: 'BRL'
          }).format(price)}
        </p>)}

        {linkTo && (
          <Link
            to={linkTo}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
          >
            Saiba Mais
          </Link>
        )}
      </div>
    </div>
  );
}
