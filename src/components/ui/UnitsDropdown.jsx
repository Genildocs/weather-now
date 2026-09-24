// ==========================================
// Component: UnitsDropdown (React)
// ==========================================
// Menu de unidades: lê e escreve direto na store (sem props obrigatórias).
// Padrão de acessibilidade: "menu button" (WAI-ARIA APG).

import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { Button } from './Button';
import { UNIT_OPTIONS, getSystem, useUnitsStore } from '../../stores/useUnitsStore';

// Opção de unidade: classe base + destaque quando ativa
const optionVariants = cva('units-dropdown__option', {
  variants: {
    active: {
      true: 'units-dropdown__option--active',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
});

// Seletor usado para achar os itens navegáveis dentro do painel
const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"]';

export function UnitsDropdown({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

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

  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Lista atual de itens focáveis do painel
  function getItems() {
    return Array.from(panelRef.current?.querySelectorAll(ITEM_SELECTOR) ?? []);
  }

  function focusItem(index) {
    const items = getItems();
    if (items.length === 0) return;
    // Módulo "dá a volta": depois do último vem o primeiro
    const next = (index + items.length) % items.length;
    items[next].focus();
  }

  function close({ returnFocus = false } = {}) {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  // Ao abrir, leva o foco para o primeiro item
  useEffect(() => {
    if (isOpen) panelRef.current?.querySelector(ITEM_SELECTOR)?.focus();
  }, [isOpen]);

  // Clique fora fecha o menu (pointerdown cobre mouse, toque e caneta)
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // Setas no gatilho também abrem o menu
  function handleTriggerKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  // Navegação dentro do painel (roving focus simples)
  function handlePanelKeyDown(event) {
    const items = getItems();
    const index = items.indexOf(document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(0);
        break;
      case 'End':
        event.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        close({ returnFocus: true });
        break;
      case 'Tab':
        // Tab sai do menu: fecha sem prender o foco
        close();
        break;
      default:
        break;
    }
  }

  function handleSystemClick() {
    setSystem(targetSystem);
    close({ returnFocus: true });
  }

  return (
    <div ref={rootRef} className={clsx('units-dropdown', isOpen && 'units-dropdown--open', className)}>
      <Button
        ref={triggerRef}
        id={triggerId}
        variant="unit"
        iconLeft="settings"
        iconRight="expand_more"
        label="Unidades"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleTriggerKeyDown}
      />

      <div
        ref={panelRef}
        id={panelId}
        role="menu"
        aria-labelledby={triggerId}
        className="units-dropdown__panel"
        onKeyDown={handlePanelKeyDown}
      >
        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          className="units-dropdown__system"
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
            <div key={key} className="units-dropdown__section">
              <div className="units-dropdown__divider" role="separator" />

              <div role="group" aria-labelledby={titleId} className="units-dropdown__group">
                <span id={titleId} className="units-dropdown__group-title">
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
                        <span className="material-symbols-outlined units-dropdown__check" aria-hidden="true">
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
