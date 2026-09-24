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

  const latitudeParam = searchParams.get('lat');
  const longitudeParam = searchParams.get('lon');
  const rawLatitude = Number(latitudeParam);
  const rawLongitude = Number(longitudeParam);
  const hasCoordinates =
    latitudeParam !== null &&
    longitudeParam !== null &&
    latitudeParam.trim() !== '' &&
    longitudeParam.trim() !== '' &&
    Number.isFinite(rawLatitude) &&
    rawLatitude >= -90 &&
    rawLatitude <= 90 &&
    Number.isFinite(rawLongitude) &&
    rawLongitude >= -180 &&
    rawLongitude <= 180;

  const rawCity = searchParams.get('city');
  const city =
    rawCity != null && rawCity.trim() !== ''
      ? rawCity.trim()
      : hasCoordinates
        ? ''
        : DEFAULT_CITY;

  const target = hasCoordinates
    ? {
        kind: 'location',
        location: {
          name: city,
          admin1: '',
          country: '',
          countryCode: '',
          latitude: rawLatitude,
          longitude: rawLongitude,
          timezone: 'auto',
          source: 'url',
        },
      }
    : { kind: 'query', city };

  function setCity(name) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('city', name);
      next.delete('lat');
      next.delete('lon');
      return next;
    });
  }

  function setLocation(location) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (location.name && location.name !== 'Minha localização') {
        next.set('city', location.name);
      } else {
        next.delete('city');
      }
      next.set('lat', String(location.latitude));
      next.set('lon', String(location.longitude));
      return next;
    });
  }

  return {
    city,
    target,
    signature: hasCoordinates
      ? `${city || 'geo'}|${rawLatitude.toFixed(4)},${rawLongitude.toFixed(4)}`
      : `${city}|query`,
    setCity,
    setLocation,
  };
}

export default useWeatherParams;
