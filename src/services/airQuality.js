// ==========================================
// Serviço: Qualidade do ar (IQA europeu + partículas)
// ==========================================
// Doc: https://open-meteo.com/en/docs/air-quality-api

import { airQualityApi } from './http';

export async function getAirQuality({ latitude, longitude }, { signal } = {}) {
  const { data } = await airQualityApi.get('/air-quality', {
    params: {
      latitude,
      longitude,
      current: 'european_aqi,pm2_5,pm10',
      timezone: 'auto',
    },
    signal,
  });

  const c = data.current ?? {};
  return {
    europeanAqi: c.european_aqi ?? null,
    pm2_5: c.pm2_5 ?? null, // µg/m³
    pm10: c.pm10 ?? null, // µg/m³
  };
}
