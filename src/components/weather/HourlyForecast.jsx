// ==========================================
// Component: HourlyForecast (React)
// ==========================================
// Seção "Previsão por hora": seletor de dia + abas (12 h | 24 h | Vento)
// e um trilho horizontal de cards (HourCard).
//
// Fuso: todas as datas/horas usam o fuso DA CIDADE (`timezone`), nunca o do
// navegador. O "dia" de cada hora vem de dayKey(ms, timezone).
//
// Janela de horas:
// - Hoje: começa na hora atual (card "Agora") e pode passar da meia-noite
// - Outro dia: começa às 00:00 daquele dia
//
// Dia CONTROLADO: quem manda no dia escolhido é a HomePage (a seção de 7 dias
// também troca o dia). Aqui chega `selectedDay` (dayKey) + `onDayChange`.
// `ref` (React 19: ref é uma prop comum) aponta para a <section>, para a
// HomePage poder rolar a página até ela.

import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { DaySelect } from '../ui/DaySelect';
import HourCard from './HourCard';
import { getWeatherInfo } from '../../services/weatherCodes';
import { scrollBehavior } from '../../lib/motion';
import {
  dayKey,
  formatNumber,
  formatShortDate,
  formatTime,
  rainBand,
  relativeDayName,
  windDirection,
} from '../../lib/format';

const HOUR_MS = 60 * 60 * 1000;

// Abas: id, rótulo, quantas horas mostra e qual "miolo" o card usa
const TABS = [
  { id: '12h', label: '12 horas', count: 12, mode: 'forecast' },
  { id: '24h', label: '24 horas', count: 24, mode: 'forecast' },
  { id: 'wind', label: 'Vento', count: 12, mode: 'wind' },
];

const SUBTITLES = {
  forecast: 'Temperatura e chance de chuva no horário local da cidade',
  wind: 'Velocidade e direção do vento no horário local da cidade',
};

// Opções do seletor: "Hoje", "Amanhã", depois "Sex, 26 set"
function buildDayOptions(daily, timezone, now) {
  return daily.map((day) => ({
    value: dayKey(day.date, timezone),
    label: relativeDayName(day.date, timezone, now) ?? formatShortDate(day.date, timezone),
  }));
}

// Recorta as horas da janela escolhida
function selectHours(hourly, { day, isToday, count, timezone, now }) {
  const start = isToday
    ? // hora atual: a primeira cuja faixa [hora, hora + 1h) ainda não acabou
      hourly.findIndex((hour) => now < hour.time + HOUR_MS)
    : hourly.findIndex((hour) => dayKey(hour.time, timezone) === day);

  return hourly.slice(Math.max(0, start), Math.max(0, start) + count);
}

// O trilho está encostado no começo/fim? (1px de folga p/ arredondamento)
function readEdges(rail) {
  const max = rail.scrollWidth - rail.clientWidth;
  return { atStart: rail.scrollLeft <= 1, atEnd: rail.scrollLeft >= max - 1 };
}

// Devolve o estado anterior se nada mudou (evita re-render à toa)
function mergeEdges(prev, next) {
  return prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next;
}

export function HourlyForecast({
  ref,
  hourly,
  daily,
  timezone,
  unitLabels,
  now,
  selectedDay: selectedDayProp, // dayKey ("2026-09-24"); inválido/ausente = primeiro dia
  onDayChange,
  className = '',
}) {
  const [tabId, setTabId] = useState('12h');
  // O trilho está no começo/fim? (desabilita os botões ◀ ▶)
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  const railRef = useRef(null);
  const listRef = useRef(null);

  const id = useId();
  const panelId = `${id}-panel`;
  const tabDomId = (tab) => `${id}-tab-${tab}`;

  // Atualiza `edges` quando o trilho muda de tamanho ou o conteúdo muda de
  // largura (troca de aba/dia). O ResizeObserver também dispara uma vez ao
  // começar a observar, então já nasce com o valor certo.
  useEffect(() => {
    const rail = railRef.current;
    const list = listRef.current;
    if (!rail || !list) return;

    const observer = new ResizeObserver(() => setEdges((prev) => mergeEdges(prev, readEdges(rail))));
    observer.observe(rail);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // Trocou o dia (aqui no seletor OU num card de 7 dias) → trilho volta ao começo.
  // Efeito só mexe no DOM (sem setState), então o React Compiler não reclama.
  useEffect(() => {
    railRef.current?.scrollTo({ left: 0, behavior: scrollBehavior() });
  }, [selectedDayProp]);

  if (!hourly?.length || !daily?.length) return null;

  const dayOptions = buildDayOptions(daily, timezone, now);
  const selectedDay = dayOptions.some((o) => o.value === selectedDayProp)
    ? selectedDayProp
    : dayOptions[0].value;
  const isToday = selectedDay === dayKey(now, timezone);
  const tab = TABS.find((t) => t.id === tabId);

  const hours = selectHours(hourly, { day: selectedDay, isToday, count: tab.count, timezone, now });

  function scrollToStart() {
    railRef.current?.scrollTo({ left: 0, behavior: scrollBehavior() });
  }

  function selectTab(nextId) {
    setTabId(nextId);
    scrollToStart();
  }

  // Setas ←/→ (e Home/End) andam entre as abas e já ativam (ativação automática)
  function handleTabKeyDown(event) {
    const index = TABS.findIndex((t) => t.id === tabId);
    const moves = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: TABS.length - 1,
    };
    if (!(event.key in moves)) return;

    event.preventDefault();
    const next = (moves[event.key] + TABS.length) % TABS.length;
    selectTab(TABS[next].id);
    event.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus();
  }

  // Botões ◀ ▶: rolam ~80% da largura visível
  function scrollByPage(direction) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: scrollBehavior() });
  }

  return (
    <section
      ref={ref}
      className={clsx('hourly-forecast', className)}
      aria-labelledby={`${id}-title`}
    >
      <header className="hourly-forecast__header">
        <div className="hourly-forecast__heading">
          <h2 id={`${id}-title`} className="hourly-forecast__title">
            Previsão por hora
          </h2>
          <p className="hourly-forecast__subtitle">{SUBTITLES[tab.mode]}</p>
        </div>

        <div className="hourly-forecast__controls">
          <DaySelect options={dayOptions} value={selectedDay} onChange={onDayChange} />

          <div
            role="tablist"
            aria-label="Visualização"
            className="hourly-forecast__tabs"
            onKeyDown={handleTabKeyDown}
          >
            {TABS.map((t) => {
              const isSelected = t.id === tabId;
              return (
                <button
                  key={t.id}
                  id={tabDomId(t.id)}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={panelId}
                  tabIndex={isSelected ? 0 : -1}
                  className={clsx('hourly-forecast__tab', isSelected && 'hourly-forecast__tab--active')}
                  onClick={() => selectTab(t.id)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="hourly-forecast__body">
        <Button
          variant="icon-only"
          iconLeft="chevron_left"
          className="hourly-forecast__nav hourly-forecast__nav--prev"
          aria-label="Horas anteriores"
          aria-controls={panelId}
          disabled={edges.atStart}
          onClick={() => scrollByPage(-1)}
        />

        {/* O trilho é o painel da aba; tabIndex=0 deixa rolar pelo teclado */}
        <div
          ref={railRef}
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabDomId(tabId)}
          tabIndex={0}
          className="hourly-forecast__rail"
          onScroll={(event) => {
            const next = readEdges(event.currentTarget);
            setEdges((prev) => mergeEdges(prev, next));
          }}
        >
          <ol ref={listRef} className="hourly-forecast__list">
            {hours.map((hour, i) => {
              const isNow = isToday && i === 0;
              // Primeira hora de um dia novo (passou da meia-noite) → mostra a data
              const isNewDay =
                i > 0 && dayKey(hour.time, timezone) !== dayKey(hours[i - 1].time, timezone);

              return (
                <HourCard
                  key={hour.time}
                  mode={tab.mode}
                  time={isNow ? 'Agora' : formatTime(hour.time, timezone)}
                  dateLabel={isNewDay ? formatShortDate(hour.time, timezone) : undefined}
                  isNow={isNow}
                  weatherCode={hour.weatherCode}
                  isDay={hour.isDay}
                  condition={getWeatherInfo(hour.weatherCode).label}
                  temp={`${formatNumber(hour.temperature)}`}
                  tempUnit={unitLabels.temperature}
                  rainChance={hour.precipitationProbability ?? 0}
                  rainLabel={`${formatNumber(hour.precipitationProbability)}% chuva`}
                  rainBand={rainBand(hour.precipitationProbability)}
                  windSpeed={formatNumber(hour.windSpeed)}
                  windUnit={unitLabels.windSpeed}
                  windDegrees={hour.windDirection ?? 0}
                  windLabel={`${windDirection(hour.windDirection)} · ${formatNumber(hour.windDirection)}°`}
                />
              );
            })}
          </ol>
        </div>

        <Button
          variant="icon-only"
          iconLeft="chevron_right"
          className="hourly-forecast__nav hourly-forecast__nav--next"
          aria-label="Próximas horas"
          aria-controls={panelId}
          disabled={edges.atEnd}
          onClick={() => scrollByPage(1)}
        />
      </div>
    </section>
  );
}

export default HourlyForecast;
