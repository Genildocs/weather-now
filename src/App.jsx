import { useState } from 'react';
import Header from './components/layout/Header';
import BentoGrid from './components/layout/BentoGrid';
import CityHeader from './components/weather/CityHeader';
import HeroCard from './components/weather/HeroCard';
import MetricTile from './components/weather/MetricTile';
import { TileStrip, ProgressBar, SegmentBar, SolarArc } from './components/weather/TileFooters';

// Dados de exemplo (mockup) — depois vêm da API de clima
const current = {
  condition: 'Stratocumulus esparsos',
  description: 'Brisa leve de sudoeste com sol intermitente',
  temp: 21,
  feelsLike: 20.4,
  max: 24,
  min: 14,
  daylight: '4h 18m',
  comfort: 'Conforto ideal',
};

// Dados de exemplo da estação (cabeçalho da cidade)
const stationInfo = {
  station: 'Estação Doppler #4092',
  syncCycle: 'Ciclo de sync: 30s',
  metar: 'EDDB',
  dateLabel: 'Quinta-feira, 24 de outubro de 2025',
  timeLabel: '14:42 CEST',
  updatedLabel: 'Telemetria atualizada há 2 min',
  hazardsLabel: 'Sem alertas severos',
  stats: [
    { icon: 'compress', label: 'Barômetro', value: '1014.8 hPa' },
    { icon: 'visibility', label: 'Visibilidade', value: '10.0 km' },
    { icon: 'cloud', label: 'Base de nuvens', value: '1850 m' },
  ],
};

export default function App() {
  const [isMetric, setIsMetric] = useState(true);
  const [city, setCity] = useState('Berlin, Germany');

  function handleToggleUnit() {
    setIsMetric((prev) => !prev);
  }

  function handleSearch(newCity) {
    setCity(newCity);
    console.log('Buscar clima para:', newCity);
  }

  return (
    <div className="app-container">
      <Header isMetric={isMetric} onToggleUnit={handleToggleUnit} onSearch={handleSearch} />

      <main className="main-content">
        {/* Brilhos atmosféricos do fundo (decorativos) */}
        <span className="main-content__glow--blue" aria-hidden="true" />
        <span className="main-content__glow--orange" aria-hidden="true" />

        <CityHeader city={city} {...stationInfo} />

        <BentoGrid hero={<HeroCard {...current} />}>
          <MetricTile label="Vento" icon="air" iconColor="blue" value="14" unit="km/h">
            <TileStrip
              icon="navigation"
              iconRotation={315}
              left="NO (312°)"
              right="Rajadas de 22 km/h"
              emphasis="left"
            />
          </MetricTile>

          <MetricTile
            label="Umidade / Orvalho"
            icon="humidity_percentage"
            iconColor="tertiary"
            value="62"
            unit="%"
          >
            <ProgressBar percent={62} left="Ponto de orvalho: 13.5°C" right="Equilibrado" />
          </MetricTile>

          <MetricTile label="Precipitação" icon="rainy" iconColor="blue" value="12" unit="%">
            <TileStrip left="Acumulado líquido" right="0.2 mm / 24h" emphasis="right" />
          </MetricTile>

          <MetricTile
            label="Índice UV"
            icon="light_mode"
            iconColor="orange"
            value="4.1"
            unit="Moderado"
            unitVariant="accent"
          >
            <SegmentBar
              segments={['blue', 'orange', 'muted']}
              caption="Proteção solar segura até 17:15"
            />
          </MetricTile>

          <MetricTile
            label="Qualidade do ar (IQA)"
            icon="filter_drama"
            iconColor="primary"
            value="32"
            unit="Boa"
            unitVariant="badge"
          >
            <TileStrip left="PM2.5: 7.2 µg/m³" right="PM10: 14 µg/m³" />
          </MetricTile>

          <MetricTile label="Arco solar" icon="wb_twilight" iconColor="secondary">
            <SolarArc sunrise="07:44" zenith="13:02" sunset="18:02" />
          </MetricTile>
        </BentoGrid>
      </main>
    </div>
  );
}
