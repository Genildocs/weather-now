// ==========================================
// Códigos de tempo WMO → texto (pt-BR) + ícone Material Symbols
// ==========================================
// Tabela oficial dos códigos: https://open-meteo.com/en/docs (seção "WMO Weather interpretation codes")
// Ícones com variante dia/noite usam { day, night }.

const WEATHER_CODES = {
  0: { label: 'Céu limpo', icon: { day: 'clear_day', night: 'clear_night' } },
  1: { label: 'Predominantemente limpo', icon: { day: 'clear_day', night: 'clear_night' } },
  2: {
    label: 'Parcialmente nublado',
    icon: { day: 'partly_cloudy_day', night: 'partly_cloudy_night' },
  },
  3: { label: 'Encoberto', icon: 'cloud' },
  45: { label: 'Nevoeiro', icon: 'foggy' },
  48: { label: 'Nevoeiro com geada', icon: 'foggy' },
  51: { label: 'Garoa fraca', icon: 'rainy' },
  53: { label: 'Garoa moderada', icon: 'rainy' },
  55: { label: 'Garoa intensa', icon: 'rainy' },
  56: { label: 'Garoa congelante fraca', icon: 'weather_mix' },
  57: { label: 'Garoa congelante intensa', icon: 'weather_mix' },
  61: { label: 'Chuva fraca', icon: 'rainy' },
  63: { label: 'Chuva moderada', icon: 'rainy' },
  65: { label: 'Chuva forte', icon: 'rainy' },
  66: { label: 'Chuva congelante fraca', icon: 'weather_mix' },
  67: { label: 'Chuva congelante forte', icon: 'weather_mix' },
  71: { label: 'Neve fraca', icon: 'weather_snowy' },
  73: { label: 'Neve moderada', icon: 'weather_snowy' },
  75: { label: 'Neve forte', icon: 'weather_snowy' },
  77: { label: 'Grãos de neve', icon: 'grain' },
  80: { label: 'Pancadas de chuva fracas', icon: 'rainy' },
  81: { label: 'Pancadas de chuva moderadas', icon: 'rainy' },
  82: { label: 'Pancadas de chuva violentas', icon: 'rainy' },
  85: { label: 'Pancadas de neve fracas', icon: 'weather_snowy' },
  86: { label: 'Pancadas de neve fortes', icon: 'weather_snowy' },
  95: { label: 'Trovoada', icon: 'thunderstorm' },
  96: { label: 'Trovoada com granizo fraco', icon: 'thunderstorm' },
  99: { label: 'Trovoada com granizo forte', icon: 'thunderstorm' },
};

const UNKNOWN = { label: 'Condição desconhecida', icon: 'question_mark' };

// getWeatherInfo(61, true) → { label: 'Chuva fraca', icon: 'rainy' }
export function getWeatherInfo(code, isDay = true) {
  const entry = WEATHER_CODES[code] ?? UNKNOWN;
  const icon = typeof entry.icon === 'string' ? entry.icon : entry.icon[isDay ? 'day' : 'night'];
  return { label: entry.label, icon };
}
