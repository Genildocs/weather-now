// ==========================================
// Hook: useWeather({ city })
// ==========================================
// Busca o clima da cidade e expõe:
// - status: 'idle' | 'loading' | 'success' | 'not-found' | 'error'
// - data: objeto já normalizado para a UI (ou null)
// - error: o erro da última tentativa (ou null)
// - isRefreshing: true quando recarrega mas ainda mostra os dados anteriores
// - retry(): tenta de novo
//
// As unidades vêm da store (useUnitsStore). Trocar qualquer uma das três
// refaz o pedido, mantendo os dados anteriores na tela (isRefreshing).
//
// Truque: cada pedido tem uma "chave" (cidade + unidades + tentativa).
// Se a chave do resultado guardado é diferente da atual, é porque o pedido
// novo ainda está em andamento → está carregando. Assim não precisamos
// chamar setState dentro do corpo do effect (só quando a resposta chega).

import { useEffect, useState } from 'react';
import { loadWeather } from '../services/weather';
import { isCanceled } from '../services/http';
import { useUnitsStore } from '../stores/useUnitsStore';

const INITIAL = { key: null, status: 'idle', data: null, error: null };

export function useWeather({ city }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(INITIAL);

  // Seletores atômicos (Zustand v5): cada um devolve uma string
  const temperature = useUnitsStore((s) => s.temperature);
  const windSpeed = useUnitsStore((s) => s.windSpeed);
  const precipitation = useUnitsStore((s) => s.precipitation);

  const trimmedCity = city?.trim() ?? '';
  const key = `${trimmedCity}|${temperature}|${windSpeed}|${precipitation}|${attempt}`;

  useEffect(() => {
    if (!trimmedCity) return;

    // Cancela a requisição se a cidade/unidade mudar antes da resposta
    const controller = new AbortController();

    const units = { temperature, windSpeed, precipitation };

    loadWeather({ city: trimmedCity, units }, { signal: controller.signal })
      .then((response) => {
        // not-found não guarda dados; success guarda os novos
        setResult({ key, status: response.status, data: response.data ?? null, error: null });
      })
      .catch((error) => {
        if (isCanceled(error)) return; // pedido antigo, ignorar
        // Mantém os dados anteriores (se houver) para não "piscar" a tela
        setResult((prev) => ({ key, status: 'error', data: prev.data, error }));
      });

    return () => controller.abort();
  }, [key, trimmedCity, temperature, windSpeed, precipitation]);

  function retry() {
    setAttempt((n) => n + 1);
  }

  // Sem cidade: nada a fazer
  if (!trimmedCity) return { ...INITIAL, isRefreshing: false, retry };

  const isPending = result.key !== key;

  if (isPending) {
    // Já existe dado na tela? Continua mostrando, com o aviso de "atualizando"
    if (result.data) {
      return { status: 'success', data: result.data, error: null, isRefreshing: true, retry };
    }
    return { status: 'loading', data: null, error: null, isRefreshing: false, retry };
  }

  return {
    status: result.status,
    data: result.data,
    error: result.error,
    isRefreshing: false,
    retry,
  };
}

export default useWeather;
