// ==========================================
// Component: UnitsDropdown (React)
// ==========================================
// Menu de unidades: lê e escreve direto na store (sem props obrigatórias).
// A lógica do menu (abrir, fechar, teclado, clique fora) vem do useMenu;
// o visual base vem do bloco `.menu` (styles/_menu.scss). Aqui só fica
// o que é específico das unidades (atalho de sistema + grupos).

import { useId } from 'react';
import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { Button } from './Button';
import { useMenu } from '../../hooks/useMenu';
import { UNIT_OPTIONS, getSystem, useUnitsStore } from '../../stores/useUnitsStore';

// Opção de unidade: classe base + destaque quando ativa
const optionVariants = cva('menu__item', {
  variants: {
    active: {
      true: 'menu__item--active',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export function UnitsDropdown({ className = '' }) {
  const { isOpen, close, rootRef, triggerProps, panelProps } = useMenu();

  // Seletores atômicos: cada um devolve um valor primitivo (string/função)
  const temperature = useUnitsStore((s) => s.temperature);
  const windSpeed = useUnitsStore((s) => s.windSpeed);
  const precipitation = useUnitsStore((s) => s.precipitation);
  const system = useUnitsStore(getSystem);
  const setUnit = useUnitsStore((s) => s.setUnit);
  const setSystem = useUnitsStore((s) => s.setSystem);

  const current = { temperature, windSpeed, precipitation };
  // 'mixed' também oferece voltar ao métrico
  const targetSystem = system === 'metric' ? 'imperial' : 'metric';

  // ids dos títulos de grupo (os do gatilho/painel ficam no hook)
  const id = useId();

  function handleSystemClick() {
    setSystem(targetSystem);
    close({ returnFocus: true });
  }

  return (
    <div
      ref={rootRef}
      className={clsx('menu', 'units-dropdown', isOpen && 'menu--open', className)}
    >
      <Button
        {...triggerProps}
        variant="unit"
        iconLeft="settings"
        iconRight="expand_more"
        label="Unidades"
      />

      <div {...panelProps} className="menu__panel">
        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          className="menu__item units-dropdown__system"
          onClick={handleSystemClick}
        >
          <span className="material-symbols-outlined units-dropdown__system-icon" aria-hidden="true">
            swap_horiz
          </span>
          {targetSystem === 'imperial' ? 'Mudar para Imperial' : 'Mudar para Métrico'}
        </button>

        {Object.entries(UNIT_OPTIONS).map(([key, category]) => {
          const titleId = `${id}-${key}-title`;

          return (
            <div key={key}>
              <div className="menu__divider" role="separator" />

              <div role="group" aria-labelledby={titleId} className="menu__group">
                <span id={titleId} className="menu__group-title">
                  {category.label}
                </span>

                {category.options.map((option) => {
                  const isActive = current[key] === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={isActive}
                      tabIndex={-1}
                      className={optionVariants({ active: isActive })}
                      onClick={() => setUnit(key, option.value)}
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
        })}
      </div>
    </div>
  );
}

export default UnitsDropdown;
