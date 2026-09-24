// ==========================================
// Component: DayCard (React)
// ==========================================
// Um dia da previsão de 7 dias. É um <button>: clicar (ou Enter/Espaço)
// escolhe esse dia na seção "Previsão por hora". Recebe tudo já formatado.
//
// Barra térmica: o trilho inteiro = faixa da SEMANA (mín → máx global);
// o trecho colorido vai do mín ao máx DESTE dia. As pontas chegam em %
// (`rangeStart`/`rangeEnd`) e viram custom properties para o SCSS.

import clsx from 'clsx';
import WeatherIcon from './WeatherIcon';

export function DayCard({
  name, // "Hoje", "Amanhã", "Sáb"
  dateLabel, // "27 set"
  weatherCode,
  condition, // "Chuva fraca"
  max, // "28" (já formatado)
  min,
  tempUnit, // "°C"
  rainLabel, // "40%"
  rangeStart = 0, // % do trilho onde começa o trecho do dia
  rangeEnd = 100, // % onde termina
  isToday = false,
  isSelected = false, // dia mostrado agora na seção por hora
  onSelect,
  className = '',
}) {
  return (
    <button
      type="button"
      className={clsx(
        'day-card',
        isToday && 'day-card--today',
        isSelected && 'day-card--selected',
        className,
      )}
      aria-pressed={isSelected}
      // Nome curto e completo (o conteúdo visual tem muitas peças soltas)
      aria-label={`${name}, ${dateLabel}: ${condition}, máxima ${max}${tempUnit}, mínima ${min}${tempUnit}, chuva ${rainLabel}. Ver por hora`}
      onClick={onSelect}
    >
      <span className="day-card__when">
        <span className="day-card__name">{name}</span>
        <span className="day-card__date">{dateLabel}</span>
      </span>

      <span className="day-card__icon">
        {/* Animado, mas pausado pelo CSS fora do hover/foco (igual ao HourCard) */}
        <WeatherIcon code={weatherCode} isDay size={40} />
      </span>

      <span className="day-card__condition">{condition}</span>

      <span className="day-card__rain">
        <span className="material-symbols-outlined day-card__rain-icon" aria-hidden="true">
          water_drop
        </span>
        {rainLabel}
      </span>

      <span
        className="day-card__range"
        style={{ '--range-start': `${rangeStart}%`, '--range-end': `${rangeEnd}%` }}
      >
        <span className="day-card__range-fill" />
      </span>

      <span className="day-card__temps">
        <span className="day-card__max">
          {max}
          <span className="day-card__unit">{tempUnit}</span>
        </span>
        <span className="day-card__min">
          {min}
          <span className="day-card__unit">{tempUnit}</span>
        </span>
      </span>
    </button>
  );
}

export default DayCard;
