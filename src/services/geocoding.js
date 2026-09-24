import axios from 'axios';
import { geocodingApi, isCanceled } from './http.js';

function distanceSquared(a, b) {
  return (a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2;
}

function extractBdcCityName(data) {
  if (!data) return '';
  const isRegion = (str) => !str || /^(regi[aã]o|metropolitan|greater)\s/i.test(str.trim());
  if (data.city && !isRegion(data.city)) return data.city;
  if (data.locality && !isRegion(data.locality)) return data.locality;
  if (Array.isArray(data.localityInfo?.administrative)) {
    const admin = [...data.localityInfo.administrative].reverse().find(
      (a) => a.adminLevel >= 6 && a.name && !isRegion(a.name),
    );
    if (admin) return admin.name;
  }
  if (data.city) return data.city;
  return data.locality || data.principalSubdivision || '';
}

// Converte um item da API no formato que o app usa (só o que importa)
function normalizeCity(item) {
  return {
    id: item.id,
    name: item.name,
    admin1: item.admin1 ?? '', // estado / região
    country: item.country ?? '',
    countryCode: item.country_code ?? '',
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone ?? 'auto',
  };
}

// Busca até 5 cidades pelo nome. Sem resultado → [] (a API omite `results`)
export async function searchCity(name, { signal } = {}) {
  const { data } = await geocodingApi.get('/search', {
    params: { name, count: 5, language: 'pt', format: 'json' },
    signal,
  });

  return (data.results ?? []).map(normalizeCity);
}

// Geocoding reverso: converte coordenadas (latitude, longitude) no nome da cidade.
// 1) BigDataCloud (client-side free API sem chave)
// 2) Photon / OpenStreetMap (fallback)
// 3) Canonização pela Open-Meteo (garante fuso, ids e ortografia oficial)
export async function reverseGeocode({ latitude, longitude } = {}, { signal } = {}) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  let raw = null;

  // 1. Provedor primário: BigDataCloud (projetado para chamadas do navegador)
  const bdcEndpoints = [
    'https://api-bdc.io/data/reverse-geocode-client',
    'https://api.bigdatacloud.net/data/reverse-geocode-client',
  ];

  for (const endpoint of bdcEndpoints) {
    try {
      const { data } = await axios.get(endpoint, {
        params: { latitude: lat, longitude: lon, localityLanguage: 'pt' },
        timeout: 4_000,
        signal,
      });
      const name = extractBdcCityName(data);
      if (name) {
        raw = {
          name,
          admin1: data.principalSubdivision || '',
          country: data.countryName || '',
          countryCode: data.countryCode || '',
        };
        break;
      }
    } catch (error) {
      if (isCanceled(error)) throw error;
      // Tenta próximo endpoint ou fallback
    }
  }

  // 2. Fallback secundário: Photon (OpenStreetMap)
  if (!raw) {
    try {
      const { data } = await axios.get('https://photon.komoot.io/reverse', {
        params: { lat, lon },
        timeout: 4_000,
        signal,
      });
      const props = data?.features?.[0]?.properties || {};
      const name =
        props.city || props.town || props.village || props.municipality || props.name || '';
      if (name) {
        raw = {
          name,
          admin1: props.state || '',
          country: props.country || '',
          countryCode: (props.countrycode || '').toUpperCase(),
        };
      }
    } catch (error) {
      if (isCanceled(error)) throw error;
    }
  }

  if (!raw?.name) return null;

  // 3. Canonização via Open-Meteo search (alinha timezone, ID e nome canônico)
  try {
    const matches = await searchCity(raw.name, { signal });
    if (matches.length > 0) {
      const closest = matches.reduce(
        (best, item) =>
          distanceSquared(item, { latitude: lat, longitude: lon }) <
          distanceSquared(best, { latitude: lat, longitude: lon })
            ? item
            : best,
        matches[0],
      );
      // Se a cidade mais próxima na Open-Meteo estiver a menos de ~150km (1.5° = 2.25)
      if (distanceSquared(closest, { latitude: lat, longitude: lon }) < 2.25) {
        return {
          id: closest.id,
          name: closest.name,
          admin1: closest.admin1 || raw.admin1,
          country: closest.country || raw.country,
          countryCode: closest.countryCode || raw.countryCode,
          latitude: lat,
          longitude: lon,
          timezone: closest.timezone || 'auto',
          source: 'geolocation',
        };
      }
    }
  } catch (error) {
    if (isCanceled(error)) throw error;
  }

  return {
    id: null,
    name: raw.name,
    admin1: raw.admin1,
    country: raw.country,
    countryCode: raw.countryCode,
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    source: 'geolocation',
  };
}
