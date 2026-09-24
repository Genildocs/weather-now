// ==========================================
// Component: MetricTile (React)
// ==========================================
// Tile de métrica: label + ícone no topo, valor + unidade, rodapé via children

import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { ACCENT_COLORS, accentVariants } from './accentColors';

// Ícone: classe base + uma cor do map $accent-colors
const iconVariants = cva('material-symbols-outlined metric-tile__icon', {
  variants: {
    color: accentVariants('metric-tile__icon'),
  },
  defaultVariants: {
    color: 'primary',
  },
});

// Unidade: aqui entra o `compoundVariants`.
// Temos duas props que dependem uma da outra:
// - unitVariant: text (sem modificador) | accent | badge
// - unitColor: a cor... mas ela SÓ vale quando unitVariant = 'accent'.
// Se unitColor fosse uma variante comum, a classe de cor apareceria até no
// 'text' e no 'badge'. Por isso as cores de unitColor ficam vazias ('') em
// `variants` (a prop existe, mas sozinha não gera nada) e a classe real mora em
// `compoundVariants`: "quando unitVariant = accent E unitColor = X → aplica X".
const unitVariants = cva('metric-tile__unit', {
  variants: {
    unitVariant: {
      text: '', // padrão: sem modificador
      accent: 'metric-tile__unit--accent',
      badge: 'metric-tile__unit--badge',
    },
    unitColor: Object.fromEntries(ACCENT_COLORS.map((color) => [color, ''])),
  },
  // Uma regra por cor: { unitVariant: 'accent', unitColor: 'blue', class: '...--blue' }
  compoundVariants: ACCENT_COLORS.map((color) => ({
    unitVariant: 'accent',
    unitColor: color,
    class: `metric-tile__unit--${color}`,
  })),
  defaultVariants: {
    unitVariant: 'text',
    unitColor: 'secondary',
  },
});

export function MetricTile({
  label,
  icon,
  iconColor = 'primary', // primary | secondary | tertiary | blue | orange
  value,
  unit,
  unitVariant = 'text', // text | accent | badge
  unitColor = 'secondary', // cor usada quando unitVariant = 'accent'
  children,
  className = '',
  ...props
}) {
  return (
    <article className={clsx('metric-tile', className)} {...props}>
      <header className="metric-tile__header">
        <span className="metric-tile__label">{label}</span>
        {icon && (
          <span className={iconVariants({ color: iconColor })} aria-hidden="true">
            {icon}
          </span>
        )}
      </header>

      {value != null && (
        <div className="metric-tile__reading">
          <span className="metric-tile__value">{value}</span>
          {unit && <span className={unitVariants({ unitVariant, unitColor })}>{unit}</span>}
        </div>
      )}

      {children}
    </article>
  );
}

export default MetricTile;
