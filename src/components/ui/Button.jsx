// ==========================================
// Component: Button (React)
// ==========================================

import { cva } from 'class-variance-authority';

// cva = "class variance authority": descreve as classes do botão como dados.
// - 1º argumento: classe base, sempre presente
// - variants: cada valor de prop vira uma classe (lista espelha _button.scss)
// - defaultVariants: usado quando a prop não é passada
const buttonVariants = cva('app-btn', {
  variants: {
    variant: {
      default: 'btn--default',
      unit: 'btn--unit',
      primary: 'btn--primary',
      'icon-only': 'btn--icon-only',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export function Button({
  children,
  label = '',
  iconLeft = '',
  iconRight = '',
  variant = 'default',
  onClick,
  title = '',
  id = '',
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  // Aceita conteúdo via children ou prop label
  const content = children ?? label;

  return (
    <button
      id={id || undefined}
      type={type}
      title={title || undefined}
      disabled={disabled}
      onClick={onClick}
      className={buttonVariants({ variant, className })}
      {...props}
    >
      {iconLeft && (
        // aria-hidden: o nome do ícone ("settings") não entra no nome acessível
        <span className="material-symbols-outlined btn-icon btn-icon-left" aria-hidden="true">
          {iconLeft}
        </span>
      )}
      {content && <span className="btn-label">{content}</span>}
      {iconRight && (
        <span className="material-symbols-outlined btn-icon btn-icon-right" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
}

export default Button;
