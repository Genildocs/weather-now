// ==========================================
// Helpers de formatação e classificação (pt-BR)
// ==========================================
// Funções puras: recebem números/datas e devolvem texto pronto pra UI.

const LOCALE = 'pt-BR';
const EMPTY = '—';

const isMissing = (value) => value == null || Number.isNaN(value);

// --- Números ---

// formatNumber(1014.83, 1) → "1.014,8"
export function formatNumber(value, decimals = 0) {
  if (isMissing(value)) return EMPTY;
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// --- Vento ---

// 8 pontos cardeais em pt-BR (L = leste, O = oeste)
const CARDINALS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];

// windDirection(312) → "NO". Cada ponto cobre 45°, centrado no seu ângulo.
export function windDirection(degrees) {
  if (isMissing(degrees)) return EMPTY;
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return CARDINALS[index];
}

// --- Datas e horas (sempre no fuso da cidade) ---

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// formatDate(ms, 'Europe/Berlin') → "Quinta-feira, 24 de outubro de 2025"
export function formatDate(ms, timeZone) {
  const text = new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(ms);
  return capitalize(text);
}

// formatTime(ms, 'Europe/Berlin') → "14:42"; com zone: true → "14:42 GMT+2"
export function formatTime(ms, timeZone, { zone = false } = {}) {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: zone ? 'short' : undefined,
  }).format(ms);
}

// Formatadores do Intl custam caro para criar: guardamos um por fuso
const dayKeyFormatters = new Map();

// dayKey(ms, 'Asia/Tokyo') → "2026-09-24": a data LOCAL da cidade (não a do
// navegador). O locale en-CA já devolve no formato AAAA-MM-DD, bom para comparar.
export function dayKey(ms, timeZone) {
  let formatter = dayKeyFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    dayKeyFormatters.set(timeZone, formatter);
  }
  return formatter.format(ms);
}

// formatShortDate(ms, 'America/Sao_Paulo') → "Sex, 26 set"
// O pt-BR escreve "sex." e "set." com ponto; tiramos o ponto e juntamos as partes.
export function formatShortDate(ms, timeZone) {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).formatToParts(ms);
  const get = (type) => parts.find((part) => part.type === type)?.value.replace('.', '') ?? '';
  return `${capitalize(get('weekday'))}, ${get('day')} ${get('month')}`;
}

// formatRelative(fetchedAt, agora) → "agora" | "há 3 min" | "há 2 h"
export function formatRelative(fromMs, nowMs) {
  const minutes = Math.max(0, Math.floor((nowMs - fromMs) / 60_000));
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.floor(minutes / 60)} h`;
}

// formatDuration(15_480_000) → "4h 18m"
export function formatDuration(ms) {
  if (isMissing(ms) || ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${minutes}m`;
}

// Luz do dia que ainda resta: do "agora" até o pôr do sol (0 se já anoiteceu)
export function daylightRemaining(sunriseMs, sunsetMs, nowMs) {
  if (nowMs >= sunsetMs) return 0;
  // Antes do nascer: o dia inteiro ainda está por vir
  return sunsetMs - Math.max(nowMs, sunriseMs);
}

// Posição do sol no arco: 0 = nascer, 1 = pôr. Fora desse intervalo → null (noite)
export function solarProgress(sunriseMs, sunsetMs, nowMs) {
  if (nowMs < sunriseMs || nowMs > sunsetMs) return null;
  return (nowMs - sunriseMs) / (sunsetMs - sunriseMs);
}

// --- Classificações ---

// Índice UV (escala da OMS). `color` = cor de acento usada nos segmentos.
const UV_LEVELS = [
  { max: 3, label: 'Baixo', color: 'blue' },
  { max: 6, label: 'Moderado', color: 'secondary' },
  { max: 8, label: 'Alto', color: 'orange' },
  { max: 11, label: 'Muito alto', color: 'orange' },
  { max: Infinity, label: 'Extremo', color: 'orange' },
];

// uvCategory(4.1) → { level: 1, label: 'Moderado', color: 'secondary' }
export function uvCategory(uv) {
  if (isMissing(uv)) return null;
  const level = UV_LEVELS.findIndex((band) => uv < band.max);
  return { level, ...UV_LEVELS[level], total: UV_LEVELS.length };
}

// IQA europeu (European AQI): faixas de 20 em 20 pontos
const AQI_LEVELS = [
  { max: 20, label: 'Boa' },
  { max: 40, label: 'Razoável' },
  { max: 60, label: 'Moderada' },
  { max: 80, label: 'Ruim' },
  { max: 100, label: 'Muito ruim' },
  { max: Infinity, label: 'Extremamente ruim' },
];

export function aqiCategory(aqi) {
  if (isMissing(aqi)) return null;
  return AQI_LEVELS.find((band) => aqi <= band.max).label;
}

// Chance de chuva → faixa da barra (espelha o map $rain-bands do SCSS)
// rainBand(45) → 'mid'. Faixas: 0–30 low, 30–60 mid, 60–100 high.
export function rainBand(probability) {
  if (isMissing(probability) || probability < 30) return 'low';
  if (probability < 60) return 'mid';
  return 'high';
}

// --- Estimativas ---

const fahrenheitToCelsius = (f) => ((f - 32) * 5) / 9;

// Base de nuvens estimada (regra prática): (T − Td) × 125 m, com T e Td em °C.
// - temperatureUnit: 'celsius' | 'fahrenheit' (a diferença em °F vira °C × 5/9)
// - heightUnit: 'm' | 'ft' (segue o vento: km/h → m, mph → ft)
export function cloudBase(temperature, dewPoint, { temperatureUnit = 'celsius', heightUnit = 'm' } = {}) {
  if (isMissing(temperature) || isMissing(dewPoint)) return null;
  const spreadC = (temperature - dewPoint) * (temperatureUnit === 'fahrenheit' ? 5 / 9 : 1);
  const meters = Math.max(0, spreadC * 125);
  const value = heightUnit === 'ft' ? meters * 3.28084 : meters;
  return { value: Math.round(value / 10) * 10, unit: heightUnit };
}

// Conforto térmico (regra simples, feita para o app — não é índice oficial):
// 1) usa a SENSAÇÃO térmica em °C (converte se vier em °F);
// 2) define a faixa: < 0 congelante, < 10 frio, < 18 fresco, < 26 agradável,
//    < 32 quente, resto calor intenso;
// 3) na faixa agradável, a umidade decide: > 80% "Úmido", < 30% "Ar seco";
//    na faixa quente, umidade ≥ 60% vira "Abafado".
export function comfortLabel(feelsLike, humidity, isFahrenheit = false) {
  if (isMissing(feelsLike)) return null;
  const t = isFahrenheit ? fahrenheitToCelsius(feelsLike) : feelsLike;

  if (t < 0) return 'Frio congelante';
  if (t < 10) return 'Frio';
  if (t < 18) return 'Fresco';
  if (t < 26) {
    if (humidity > 80) return 'Úmido';
    if (humidity < 30) return 'Ar seco';
    return 'Conforto ideal';
  }
  if (t < 32) return humidity >= 60 ? 'Abafado' : 'Quente';
  return 'Calor intenso';
}

// Umidade relativa → palavra curta para a legenda da barra
export function humidityLabel(humidity) {
  if (isMissing(humidity)) return null;
  if (humidity < 30) return 'Seco';
  if (humidity <= 60) return 'Equilibrado';
  return 'Úmido';
}
