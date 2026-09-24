// ==========================================
// Component: HourCard (React)
// ==========================================
// Um card do trilho de previsão por hora. Recebe tudo já formatado.
// mode 'forecast': ícone + temperatura + barra de chance de chuva
// mode 'wind':     seta de direção + velocidade + ponto cardeal

import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import WeatherIcon from './WeatherIcon';

const cardVariants = cva('hour-card', {
  variants: {
    isNow: { true: 'hour-card--now', false: '' },
    // Primeira hora de um dia novo (passou da meia-noite)
    newDay: { true: 'hour-card--new-day', false: '' },
  },
  defaultVariants: { isNow: false, newDay: false },
});

// Cor da barra por faixa de chance de chuva (map $rain-bands no SCSS)
const rainFillVariants = cva('hour-card__rain-fill', {
  variants: {
    band: {
      low: 'hour-card__rain-fill--low',
      mid: 'hour-card__rain-fill--mid',
      high: 'hour-card__rain-fill--high',
    },
  },
  defaultVariants: { band: 'low' },
});

export function HourCard({
  mode = 'forecast', // 'forecast' | 'wind'
  time, // "14:00" ou "Agora"
  dateLabel, // "Qui, 24 set" — só na primeira hora de um dia novo
  isNow = false,
  // forecast
  weatherCode,
  isDay = true,
  condition, // texto da condição (nome acessível do ícone)
  temp,
  tempUnit,
  rainChance = 0, // 0–100
  rainLabel,
  rainBand = 'low',
  // wind
  windSpeed,
  windUnit,
  windDegrees = 0,
  windLabel, // "SO · 250°"
  className = '',
}) {
  return (
    <li className={clsx(cardVariants({ isNow, newDay: Boolean(dateLabel) }), className)}>
      {dateLabel && <span className="hour-card__date">{dateLabel}</span>}

      <span className="hour-card__time">{time}</span>

      {mode === 'wind' ? (
        <>
          <span className="hour-card__icon hour-card__icon--wind" aria-hidden="true">
            <span
              className="material-symbols-outlined hour-card__arrow"
              style={{ '--icon-rotation': `${windDegrees}deg` }}
            >
              navigation
            </span>
          </span>
          <span className="hour-card__value">
            {windSpeed}
            <span className="hour-card__unit hour-card__unit--text">{windUnit}</span>
          </span>
          <span className="hour-card__caption">{windLabel}</span>
        </>
      ) : (
        <>
          {/* Dia: quadrado branco (mockup); noite: "pedaço de céu" escuro */}
          <span className={clsx('hour-card__icon', !isDay && 'hour-card__icon--night')}>
            {/* Sempre animado; o CSS pausa fora do card "Agora"/hover (ver _hourly-forecast.scss) */}
            <WeatherIcon code={weatherCode} isDay={isDay} size={40} title={condition} />
          </span>
          <span className="hour-card__value">
            {temp}
            <span className="hour-card__unit">{tempUnit}</span>
          </span>
          <span className="hour-card__rain" aria-hidden="true">
            <span
              className={rainFillVariants({ band: rainBand })}
              style={{ '--rain': `${rainChance}%` }}
            />
          </span>
          <span className="hour-card__caption">{rainLabel}</span>
        </>
      )}
    </li>
  );
}

export default HourCard;
