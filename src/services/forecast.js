// ==========================================
// Serviço: Previsão do tempo (atual, por hora e diária)
// ==========================================
// Doc: https://open-meteo.com/en/docs

import { forecastApi } from './http';

// Variáveis pedidas em cada bloco (nomes conferidos na doc / API real)
const CURRENT_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'dew_point_2m',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'pressure_msl',
  'visibility',
  'uv_index',
  'is_day',
];

const HOURLY_VARS = ['temperature_2m', 'weather_code', 'precipitation_probability'];

const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_sum',
  'precipitation_probability_max',
  'daylight_duration',
];

// Pedimos os horários como unixtime (segundos): fica fácil comparar com "agora".
// Aqui viram milissegundos, o padrão do Date no JS.
const toMs = (seconds) => seconds * 1000;

// Visibilidade não tem parâmetro próprio na API. Testando de verdade, ela
// vem em pés quando precipitation_unit=inch e em metros no resto (a
// temperatura e o vento não mudam nada). Por isso lemos a unidade que veio
// (current_units.visibility), passamos para metros e só então convertemos
// para a unidade do app: km se o vento é km/h, milhas se é mph.
const METERS_PER_FOOT = 0.3048;
const METERS_PER_MILE = 1609.344;

function normalizeVisibility(value, apiUnit, windSpeed) {
  if (value == null) return null;
  const meters = apiUnit === 'ft' ? value * METERS_PER_FOOT : value;
  return windSpeed === 'mph' ? meters / METERS_PER_MILE : meters / 1000;
}

// Converte a resposta crua da API no formato que a UI usa.
// units: { temperature, windSpeed, precipitation } (valores da store)
export function normalizeForecast(raw, units) {
  const c = raw.current;
  const h = raw.hourly;
  const d = raw.daily;

  const current = {
    time: toMs(c.time),
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    dewPoint: c.dew_point_2m,
    precipitation: c.precipitation,
    weatherCode: c.weather_code,
    isDay: c.is_day === 1,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    windGusts: c.wind_gusts_10m,
    pressure: c.pressure_msl, // nível do mar, sempre em hPa (comparável entre cidades)
    visibility: normalizeVisibility(c.visibility, raw.current_units?.visibility, units.windSpeed),
    uvIndex: c.uv_index,
  };

  // Listas "colunares" da API (um array por variável) → lista de objetos
  const hourly = h.time.map((time, i) => ({
    time: toMs(time),
    temperature: h.temperature_2m[i],
    weatherCode: h.weather_code[i],
    precipitationProbability: h.precipitation_probability[i],
  }));

  const daily = d.time.map((time, i) => ({
    date: toMs(time),
    weatherCode: d.weather_code[i],
    max: d.temperature_2m_max[i],
    min: d.temperature_2m_min[i],
    sunrise: toMs(d.sunrise[i]),
    sunset: toMs(d.sunset[i]),
    uvIndexMax: d.uv_index_max[i],
    precipitationSum: d.precipitation_sum[i],
    precipitationProbabilityMax: d.precipitation_probability_max[i],
    daylightDuration: d.daylight_duration[i] * 1000, // segundos → ms
  }));

  return { timezone: raw.timezone, current, hourly, daily };
}

// units: { temperature: 'celsius'|'fahrenheit', windSpeed: 'kmh'|'mph',
//          precipitation: 'mm'|'inch' } — já são os valores da Open-Meteo
export async function getForecast({ latitude, longitude, units }, { signal } = {}) {
  const { data } = await forecastApi.get('/forecast', {
    params: {
      latitude,
      longitude,
      current: CURRENT_VARS.join(','),
      hourly: HOURLY_VARS.join(','),
      daily: DAILY_VARS.join(','),
      temperature_unit: units.temperature,
      wind_speed_unit: units.windSpeed,
      precipitation_unit: units.precipitation,
      timezone: 'auto',
      timeformat: 'unixtime',
      forecast_days: 7,
    },
    signal,
  });

  return normalizeForecast(data, units);
}
