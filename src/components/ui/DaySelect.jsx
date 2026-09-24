// ==========================================
// Component: DaySelect (React)
// ==========================================
// Seletor de dia em forma de menu (menuitemradio): "Hoje", "Amanhã", "Sex, 26 set"...
// Mesma lógica (useMenu) e mesmo visual base (.menu) do UnitsDropdown.
// Controlado: quem usa guarda o valor e recebe onChange(valor).

import clsx from 'clsx';
import { Button } from './Button';
import { useMenu } from '../../hooks/useMenu';

export function DaySelect({
  options = [], // [{ value, label }]
  value,
  onChange,
  label = 'Dia', // prefixo do nome acessível do gatilho ("Dia: Hoje")
  className = '',
}) {
  // Ao abrir, o foco cai no dia marcado (padrão APG para menus de rádio)
  const { isOpen, close, rootRef, triggerProps, panelProps } = useMenu({
    initialFocus: '[aria-checked="true"]',
  });
  const selected = options.find((option) => option.value === value) ?? options[0];

  function handleSelect(nextValue) {
    close({ returnFocus: true });
    if (nextValue !== value) onChange?.(nextValue);
  }

  return (
    <div
      ref={rootRef}
      className={clsx('menu', 'menu--align-start', isOpen && 'menu--open', className)}
    >
      <Button
        {...triggerProps}
        variant="unit"
        iconLeft="calendar_today"
        iconRight="expand_more"
        label={selected?.label}
        aria-label={`${label}: ${selected?.label ?? ''}`}
      />

      <div {...panelProps} className="menu__panel">
        {options.map((option) => {
          const isActive = option.value === selected?.value;

          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={isActive}
              tabIndex={-1}
              className={clsx('menu__item', isActive && 'menu__item--active')}
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              {isActive && (
                <span className="material-symbols-outlined menu__check" aria-hidden="true">
                  check
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DaySelect;
