// ==========================================
// Orquestração: cidade → coordenadas → previsão + qualidade do ar
// ==========================================
// Fica fora do hook para poder ser testada sem React (ex.: com node).

import { searchCity, reverseGeocode } from './geocoding.js';
import { getForecast } from './forecast.js';
import { getAirQuality } from './airQuality.js';
import { isCanceled } from './http.js';

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
function distanceSquared(a, b) {
  return (a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2;
}

// URLs guardam nome + coordenadas. Tentamos recuperar região/país pelo
// geocoding, mas uma falha nessa etapa nunca impede a previsão por coordenadas.
// Coordenadas sem nome ou com rótulo genérico são enriquecidas via reverse geocoding.
async function enrichLocation(location, signal) {
  if (!location) return location;

  const lat = Number(location.latitude);
  const lon = Number(location.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  const hasValidName =
    Boolean(location.name) &&
    location.name.trim() !== '' &&
    location.name.trim() !== 'Minha localização';

  // 1) Se não possui nome válido (vazio ou genérico), resolve via geocoding reverso
  if (!hasValidName && hasCoords) {
    try {
      const reversed = await reverseGeocode({ latitude: lat, longitude: lon }, { signal });
      if (reversed?.name) {
        return {
          ...location,
          id: reversed.id ?? location.id,
          name: reversed.name,
          admin1: reversed.admin1 || location.admin1,
          country: reversed.country || location.country,
          countryCode: reversed.countryCode || location.countryCode,
          timezone: reversed.timezone || location.timezone,
          latitude: lat,
          longitude: lon,
        };
      }
    } catch (error) {
      if (isCanceled(error)) throw error;
    }
    return location;
  }

  // 2) Se possui nome mas falta país ou admin1, tenta alinhar metadados
  if (hasValidName && (!location.country || !location.admin1)) {
    try {
      const matches = await searchCity(location.name, { signal });
      if (matches.length > 0 && hasCoords) {
        const closest = matches.reduce(
          (best, item) =>
            distanceSquared(item, { latitude: lat, longitude: lon }) <
            distanceSquared(best, { latitude: lat, longitude: lon })
              ? item
              : best,
          matches[0],
        );
        // Só aceita se estiver no mesmo raio regional (~150km, i.e. 2.25 graus²)
        if (distanceSquared(closest, { latitude: lat, longitude: lon }) < 2.25) {
          return {
            ...location,
            id: closest.id ?? location.id,
            name: closest.name || location.name,
            admin1: closest.admin1 || location.admin1,
            country: closest.country || location.country,
            countryCode: closest.countryCode || location.countryCode,
            timezone: closest.timezone || location.timezone,
            latitude: lat,
            longitude: lon,
          };
        }
      }
    } catch (error) {
      if (isCanceled(error)) throw error;
    }

    if (hasCoords) {
      try {
        const reversed = await reverseGeocode({ latitude: lat, longitude: lon }, { signal });
        if (reversed?.name) {
          return {
            ...location,
            id: reversed.id ?? location.id,
            name: reversed.name || location.name,
            admin1: reversed.admin1 || location.admin1,
            country: reversed.country || location.country,
            countryCode: reversed.countryCode || location.countryCode,
            timezone: reversed.timezone || location.timezone,
            latitude: lat,
            longitude: lon,
          };
        }
      } catch (error) {
        if (isCanceled(error)) throw error;
      }
    }
  }

  return location;
}

export async function loadWeather({ city, location: resolved, units = DEFAULT_UNITS }, { signal } = {}) {
  // Cidade digitada precisa de geocoding; uma opção/geolocalização já tem coords.
  const location = resolved
    ? await enrichLocation(resolved, signal)
    : (await searchCity(city, { signal }))[0];
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
