// ==========================================
// Component: DailyForecast (React)
// ==========================================
// Seção "Próximos 7 dias": um DayCard por dia da API.
// O dia escolhido NÃO mora aqui: chega `selectedDay` (dayKey) e, ao clicar
// num card, avisamos `onSelectDay(dayKey)` — quem usa decide o resto
// (a HomePage troca o dia da seção por hora e rola até ela).

import { useId } from 'react';
import clsx from 'clsx';
import DayCard from './DayCard';
import { getWeatherInfo } from '../../services/weatherCodes';
import {
  dayKey,
  formatDayMonth,
  formatNumber,
  formatWeekday,
  relativeDayName,
} from '../../lib/format';

// Menor trecho visível na barra (em %), para dias com mín ≈ máx
const MIN_RANGE = 6;

// Posição (0–100%) de uma temperatura dentro da faixa da semana
function toPercent(value, weekMin, weekSpan) {
  if (weekSpan <= 0) return 50; // semana toda com a mesma temperatura
  return ((value - weekMin) / weekSpan) * 100;
}

// Início/fim do trecho colorido de um dia, garantindo largura mínima
function dayRange(day, weekMin, weekSpan) {
  let start = toPercent(day.min, weekMin, weekSpan);
  let end = toPercent(day.max, weekMin, weekSpan);

  if (end - start < MIN_RANGE) {
    const middle = (start + end) / 2;
    // Centraliza no meio do dia sem sair do trilho
    start = Math.min(Math.max(0, middle - MIN_RANGE / 2), 100 - MIN_RANGE);
    end = start + MIN_RANGE;
  }
  return { start, end };
}

export function DailyForecast({
  daily,
  timezone,
  unitLabels,
  now,
  selectedDay, // dayKey do dia mostrado na seção por hora
  onSelectDay,
  className = '',
}) {
  const id = useId();
  if (!daily?.length) return null;

  // Faixa térmica da SEMANA: todos os cards usam a mesma régua
  const weekMin = Math.min(...daily.map((day) => day.min));
  const weekMax = Math.max(...daily.map((day) => day.max));
  const weekSpan = weekMax - weekMin;

  return (
    <section className={clsx('daily-forecast', className)} aria-labelledby={`${id}-title`}>
      <header className="daily-forecast__header">
        <h2 id={`${id}-title`} className="daily-forecast__title">
          Próximos 7 dias
        </h2>
        <p className="daily-forecast__subtitle">
          Máxima, mínima e chance de chuva. Toque num dia para ver hora a hora.
        </p>
      </header>

      <ol className="daily-forecast__list">
        {daily.map((day) => {
          const key = dayKey(day.date, timezone);
          const relative = relativeDayName(day.date, timezone, now);
          const { start, end } = dayRange(day, weekMin, weekSpan);

          return (
            <li key={key} className="daily-forecast__item">
              <DayCard
                name={relative ?? formatWeekday(day.date, timezone)}
                dateLabel={formatDayMonth(day.date, timezone)}
                weatherCode={day.weatherCode}
                condition={getWeatherInfo(day.weatherCode).label}
                max={formatNumber(day.max)}
                min={formatNumber(day.min)}
                tempUnit={unitLabels.temperature}
                rainLabel={`${formatNumber(day.precipitationProbabilityMax)}%`}
                rangeStart={start}
                rangeEnd={end}
                isToday={relative === 'Hoje'}
                isSelected={key === selectedDay}
                onSelect={() => onSelectDay?.(key)}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default DailyForecast;
