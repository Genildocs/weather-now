// ==========================================
// Helpers de movimento (respeitam prefers-reduced-motion)
// ==========================================

// 'smooth' normalmente; 'auto' (pulo seco) para quem pediu menos movimento.
// Uso: el.scrollTo({ left: 0, behavior: scrollBehavior() })
export function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
