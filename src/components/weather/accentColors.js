// ==========================================
// Cores de acento (compartilhadas pelos cva)
// ==========================================
// ATENÇÃO: esta lista espelha o map `$accent-colors` de src/styles/_colors.scss.
// Se adicionar/remover uma cor lá, atualize aqui também (e vice-versa),
// senão o React gera uma classe que o CSS não conhece (ou ignora uma que existe).

export const ACCENT_COLORS = ['primary', 'secondary', 'tertiary', 'blue', 'orange'];

// Gera o objeto de variantes que o cva espera a partir de um prefixo BEM:
// accentVariants('progress-bar__fill')
//   → { primary: 'progress-bar__fill--primary', secondary: '...', ... }
export function accentVariants(prefix) {
  return Object.fromEntries(ACCENT_COLORS.map((color) => [color, `${prefix}--${color}`]));
}
