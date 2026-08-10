import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  ghost: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
};

export default function Button({ children, variant = 'primary', className, href, ...props }) {
  const Tag = href ? 'a' : 'button';

  return (
    <Tag
      href={href}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 cursor-pointer',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
