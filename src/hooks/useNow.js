// ==========================================
// Hook: useNow(intervalo) → horário atual (ms), atualizado sozinho
// ==========================================
// Chamar Date.now() direto no render deixa o componente "impuro"
// (cada render daria um valor diferente). Aqui o horário vira estado
// e um timer o atualiza — ex.: "atualizado há X min" anda sozinho.

import { useEffect, useState } from 'react';

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

export default useNow;
