// ==========================================
// Hook: useWeatherParams() — cidade guardada na URL
// ==========================================
// ?city=Berlin
// - city: padrão "Berlin". Trocar de cidade faz PUSH no histórico (voltar funciona).
// - As unidades NÃO ficam na URL: moram na store (stores/useUnitsStore),
//   salvas no localStorage.

import { useSearchParams } from 'react-router-dom';

export const DEFAULT_CITY = 'Berlin';

export function useWeatherParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const city = searchParams.get('city')?.trim() || DEFAULT_CITY;

  function setCity(name) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('city', name);
      return next;
    });
  }

  return { city, setCity };
}

export default useWeatherParams;
