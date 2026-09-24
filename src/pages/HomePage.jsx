// ==========================================
// Página: Home (clima da cidade escolhida na URL)
// ==========================================
// Lê ?city= da URL, busca os dados (useWeather, que lê as unidades da store)
// e monta a tela.
// Toda a "tradução" dos números da API para texto fica aqui, nos helpers
// build*; os componentes continuam só recebendo props prontas.

import { useRef, useState } from 'react';
import clsx from 'clsx';
import BentoGrid from '../components/layout/BentoGrid';
import CityHeader from '../components/weather/CityHeader';
import HeroCard from '../components/weather/HeroCard';
import MetricTile from '../components/weather/MetricTile';
import HourlyForecast from '../components/weather/HourlyForecast';
import DailyForecast from '../components/weather/DailyForecast';
import { TileStrip, ProgressBar, SegmentBar, SolarArc } from '../components/weather/TileFooters';
import { LoadingState, NotFoundState, ErrorState } from '../components/weather/WeatherStates';
import { useWeather } from '../hooks/useWeather';
import { useWeatherParams } from '../hooks/useWeatherParams';
import { useNow } from '../hooks/useNow';
import { getWeatherInfo } from '../services/weatherCodes';
import { scrollBehavior } from '../lib/motion';
import {
  formatNumber,
  formatDate,
  formatTime,
  formatRelative,
  formatDuration,
  windDirection,
  daylightRemaining,
  solarProgress,
  uvCategory,
  aqiCategory,
  cloudBase,
  comfortLabel,
  humidityLabel,
  dayKey,
} from '../lib/format';

// --- Cabeçalho da cidade ---
function buildCityHeader(data, now) {
  const { location, current, units, unitLabels, fetchedAt } = data;
  const tz = location.timezone;
  const base = cloudBase(current.temperature, current.dewPoint, {
    temperatureUnit: units.temperature,
    heightUnit: unitLabels.height, // segue o vento (m ou ft)
  });

  return {
    city: [location.name, location.country].filter(Boolean).join(', '),
    cityTitle: location.admin1,
    // Sem estação real: mostramos a fonte dos dados. METAR, ciclo de sync,
    // radar e alertas não existem na Open-Meteo → ficam escondidos.
    station: 'Fonte: Open-Meteo',
    showRadar: false,
    hazardsLabel: null,
    dateLabel: formatDate(now, tz),
    timeLabel: formatTime(now, tz, { zone: true }),
    updatedLabel: `Telemetria atualizada ${formatRelative(fetchedAt, now)}`,
    stats: [
      { icon: 'compress', label: 'Barômetro', value: `${formatNumber(current.pressure, 1)} hPa` },
      {
        icon: 'visibility',
        label: 'Visibilidade',
        value: `${formatNumber(current.visibility, 1)} ${unitLabels.visibility}`,
      },
      {
        icon: 'cloud',
        label: 'Base de nuvens (est.)',
        value: base ? `${formatNumber(base.value)} ${base.unit}` : '—',
      },
    ],
  };
}

// --- Card principal ---
function buildHero(data, today, now) {
  const { current, units, unitLabels } = data;
  const weather = getWeatherInfo(current.weatherCode);
  const remaining = daylightRemaining(today.sunrise, today.sunset, now);

  return {
    condition: weather.label,
    weatherCode: current.weatherCode,
    isDay: current.isDay,
    description: `Vento ${windDirection(current.windDirection)} a ${formatNumber(current.windSpeed)} ${unitLabels.windSpeed}, umidade ${formatNumber(current.humidity)}%`,
    temp: formatNumber(current.temperature),
    unit: unitLabels.temperature,
    feelsLike: formatNumber(current.apparentTemperature),
    max: formatNumber(today.max),
    min: formatNumber(today.min),
    daylight: remaining > 0 ? formatDuration(remaining) : 'o sol já se pôs',
    comfort: comfortLabel(
      current.apparentTemperature,
      current.humidity,
      units.temperature === 'fahrenheit',
    ),
  };
}

// --- Tiles de métricas ---
function MetricTiles({ data, today, now }) {
  const { current, units, unitLabels, airQuality, location } = data;
  const tz = location.timezone;
  // Polegadas são números pequenos: 2 casas; milímetros: 1
  const precipitationDecimals = units.precipitation === 'inch' ? 2 : 1;

  const uv = uvCategory(current.uvIndex);
  const uvMax = uvCategory(today.uvIndexMax);
  const aqi = airQuality?.europeanAqi ?? null;
  const zenith = (today.sunrise + today.sunset) / 2; // meio do caminho entre nascer e pôr

  return (
    <>
      <MetricTile
        label="Vento"
        icon="air"
        iconColor="blue"
        value={formatNumber(current.windSpeed)}
        unit={unitLabels.windSpeed}
      >
        <TileStrip
          icon="navigation"
          iconRotation={current.windDirection ?? 0}
          left={`${windDirection(current.windDirection)} (${formatNumber(current.windDirection)}°)`}
          right={`Rajadas de ${formatNumber(current.windGusts)} ${unitLabels.windSpeed}`}
          emphasis="left"
        />
      </MetricTile>

      <MetricTile
        label="Umidade / Orvalho"
        icon="humidity_percentage"
        iconColor="tertiary"
        value={formatNumber(current.humidity)}
        unit="%"
      >
        <ProgressBar
          percent={current.humidity ?? 0}
          left={`Ponto de orvalho: ${formatNumber(current.dewPoint, 1)}${unitLabels.temperature}`}
          right={humidityLabel(current.humidity)}
        />
      </MetricTile>

      <MetricTile
        label="Precipitação"
        icon="rainy"
        iconColor="blue"
        value={formatNumber(today.precipitationProbabilityMax)}
        unit="%"
      >
        <TileStrip
          left="Acumulado hoje"
          right={`${formatNumber(today.precipitationSum, precipitationDecimals)} ${unitLabels.precipitation}`}
          emphasis="right"
        />
      </MetricTile>

      <MetricTile
        label="Índice UV"
        icon="light_mode"
        iconColor="orange"
        value={formatNumber(current.uvIndex, 1)}
        unit={uv?.label}
        unitVariant="accent"
        unitColor={uv?.color}
      >
        {/* Um segmento por faixa; acende até a faixa atual */}
        <SegmentBar
          segments={Array.from({ length: uv?.total ?? 5 }, (_, i) =>
            uv && i <= uv.level ? uv.color : 'muted',
          )}
          caption={uvMax ? `Máx. hoje: ${formatNumber(today.uvIndexMax, 1)} (${uvMax.label})` : ''}
        />
      </MetricTile>

      <MetricTile
        label="Qualidade do ar (IQA)"
        icon="filter_drama"
        iconColor="primary"
        value={formatNumber(aqi)}
        unit={aqiCategory(aqi)}
        unitVariant="badge"
      >
        {airQuality ? (
          <TileStrip
            left={`PM2.5: ${formatNumber(airQuality.pm2_5, 1)} µg/m³`}
            right={`PM10: ${formatNumber(airQuality.pm10, 1)} µg/m³`}
          />
        ) : (
          <TileStrip left="Dados indisponíveis" />
        )}
      </MetricTile>

      <MetricTile label="Arco solar" icon="wb_twilight" iconColor="secondary">
        <SolarArc
          sunrise={formatTime(today.sunrise, tz)}
          zenith={formatTime(zenith, tz)}
          sunset={formatTime(today.sunset, tz)}
          progress={solarProgress(today.sunrise, today.sunset, now)}
        />
      </MetricTile>
    </>
  );
}

// --- Previsões por hora + 7 dias (compartilham o dia escolhido) ---
// O dia escolhido mora AQUI (estado local), e não numa store:
// - só estas duas seções usam; não precisa sobreviver à troca de página;
// - a HomePage monta este componente com key = coordenadas, então trocar de
//   cidade recria tudo e o dia volta a "hoje" sozinho (sem effect de reset).
function ForecastSections({ data, now }) {
  const [day, setDay] = useState(null); // dayKey; null = primeiro dia (hoje)
  const hourlyRef = useRef(null); // <section> da previsão por hora

  const { daily, hourly, location, unitLabels } = data;
  const tz = location.timezone;

  // Resolve o dia válido uma vez e entrega o MESMO valor às duas seções
  const dayKeys = daily.map((d) => dayKey(d.date, tz));
  const selectedDay = dayKeys.includes(day) ? day : dayKeys[0];

  // Card de 7 dias: troca o dia e rola até a seção por hora
  function handleSelectDay(nextDay) {
    setDay(nextDay);
    hourlyRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }

  return (
    <>
      <HourlyForecast
        ref={hourlyRef}
        hourly={hourly}
        daily={daily}
        timezone={tz}
        unitLabels={unitLabels}
        now={now}
        selectedDay={selectedDay}
        onDayChange={setDay}
      />

      <DailyForecast
        daily={daily}
        timezone={tz}
        unitLabels={unitLabels}
        now={now}
        selectedDay={selectedDay}
        onSelectDay={handleSelectDay}
      />
    </>
  );
}

export default function HomePage() {
  const { city } = useWeatherParams();
  const { status, data, isRefreshing, retry } = useWeather({ city });
  const now = useNow();

  if (status === 'loading' || status === 'idle') return <LoadingState city={city} />;
  if (status === 'not-found') return <NotFoundState query={city} />;
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />;

  const today = data.daily[0];

  return (
    <div
      className={clsx('weather-page', isRefreshing && 'weather-page--refreshing')}
      aria-busy={isRefreshing}
    >
      <CityHeader {...buildCityHeader(data, now)} />

      <BentoGrid hero={<HeroCard {...buildHero(data, today, now)} />}>
        <MetricTiles data={data} today={today} now={now} />
      </BentoGrid>

      {/* key: trocar de cidade zera o dia/aba escolhidos (componentes novos) */}
      <ForecastSections
        key={`${data.location.latitude},${data.location.longitude}`}
        data={data}
        now={now}
      />
    </div>
  );
}
