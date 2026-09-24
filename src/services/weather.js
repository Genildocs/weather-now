// ==========================================
// Orquestração: cidade → coordenadas → previsão + qualidade do ar
// ==========================================
// Fica fora do hook para poder ser testada sem React (ex.: com node).

import { searchCity } from './geocoding';
import { getForecast } from './forecast';
import { getAirQuality } from './airQuality';
import { isCanceled } from './http';

// Unidades padrão (métrico), iguais às da store
const DEFAULT_UNITS = { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' };

// Rótulos que a UI mostra, um por categoria (a UI não precisa decidir nada).
// Regra das unidades DERIVADAS: visibilidade e base de nuvens não têm
// parâmetro próprio na API, então seguem a unidade do VENTO:
//   kmh → visibilidade em km, base de nuvens em m
//   mph → visibilidade em mi, base de nuvens em ft
export function getUnitLabels(units) {
  const isMph = units.windSpeed === 'mph';
  return {
    temperature: units.temperature === 'fahrenheit' ? '°F' : '°C',
    windSpeed: isMph ? 'mph' : 'km/h',
    precipitation: units.precipitation === 'inch' ? 'in' : 'mm',
    visibility: isMph ? 'mi' : 'km',
    height: isMph ? 'ft' : 'm',
  };
}

// Resultado: { status: 'not-found' } ou { status: 'success', data }
export async function loadWeather({ city, units = DEFAULT_UNITS }, { signal } = {}) {
  // 1) Geocoding: usamos o primeiro (mais relevante) resultado
  const [location] = await searchCity(city, { signal });
  if (!location) return { status: 'not-found' };

  const coords = { latitude: location.latitude, longitude: location.longitude };

  // 2) Previsão e qualidade do ar em paralelo.
  // Se a qualidade do ar falhar, seguimos sem ela (null) — não é essencial.
  // Cancelamento é a exceção: esse erro precisa subir para o hook ignorar.
  const [forecast, airQuality] = await Promise.all([
    getForecast({ ...coords, units }, { signal }),
    getAirQuality(coords, { signal }).catch((error) => {
      if (isCanceled(error)) throw error;
      return null;
    }),
  ]);

  return {
    status: 'success',
    data: {
      // o fuso da previsão (timezone=auto) é o mais confiável
      location: { ...location, timezone: forecast.timezone || location.timezone },
      units, // { temperature, windSpeed, precipitation } usadas no pedido
      unitLabels: getUnitLabels(units),
      current: forecast.current,
      hourly: forecast.hourly,
      daily: forecast.daily,
      airQuality,
      fetchedAt: Date.now(),
    },
  };
}
