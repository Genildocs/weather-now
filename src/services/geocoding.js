// ==========================================
// Serviço: Geocoding (nome da cidade → coordenadas)
// ==========================================
// Doc: https://open-meteo.com/en/docs/geocoding-api

import { geocodingApi } from './http';

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
