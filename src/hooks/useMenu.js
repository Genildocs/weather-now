// ==========================================
// Hook: useMenu() → lógica de um "menu button" (WAI-ARIA APG)
// ==========================================
// Tudo que um menu suspenso precisa, sem nenhum visual:
// - abrir/fechar/alternar (isOpen, open, close, toggle)
// - ao abrir, foco vai para um item (o marcado, se `initialFocus` achar)
// - setas ↑/↓, Home/End navegam; Esc fecha e devolve o foco ao gatilho;
//   Tab fecha e deixa o foco seguir
// - clique fora fecha
//
// Uso (DESESTRUTURE o retorno):
//   const { isOpen, close, rootRef, triggerProps, panelProps } = useMenu();
//   <div ref={rootRef}>
//     <button {...triggerProps}>Abrir</button>
//     <div {...panelProps}>…itens com role="menuitem(radio)"…</div>
//   </div>
// Por que desestruturar? O React Compiler vê `menu.rootRef` (nome terminado
// em Ref) e passa a tratar o objeto `menu` INTEIRO como ref — aí até ler
// `menu.isOpen` no render vira erro de lint (react-hooks/refs).

import { useEffect, useId, useRef, useState } from 'react';

// Seletor dos itens navegáveis dentro do painel
const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"]';

// initialFocus: seletor do item que recebe o foco ao abrir
// (ex.: '[aria-checked="true"]'); se não achar, vai para o primeiro item.
export function useMenu({ initialFocus = null } = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  const rootRef = useRef(null); // envolve gatilho + painel (para o clique fora)
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

  function open() {
    setIsOpen(true);
  }

  function close({ returnFocus = false } = {}) {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function toggle() {
    setIsOpen((current) => !current);
  }

  // Ao abrir, leva o foco para o item inicial (ou o primeiro)
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const target =
      (initialFocus && panel?.querySelector(initialFocus)) || panel?.querySelector(ITEM_SELECTOR);
    target?.focus();
  }, [isOpen, initialFocus]);

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

  return {
    isOpen,
    open,
    close,
    toggle,
    rootRef,
    // Espalhe no botão gatilho: {...triggerProps}
    triggerProps: {
      ref: triggerRef,
      id: triggerId,
      'aria-haspopup': 'menu',
      'aria-expanded': isOpen,
      'aria-controls': panelId,
      onClick: toggle,
      onKeyDown: handleTriggerKeyDown,
    },
    // Espalhe no painel: {...panelProps}
    panelProps: {
      ref: panelRef,
      id: panelId,
      role: 'menu',
      'aria-labelledby': triggerId,
      onKeyDown: handlePanelKeyDown,
    },
  };
}

export default useMenu;
