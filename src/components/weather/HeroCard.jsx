// ==========================================
// Component: HeroCard (React)
// ==========================================
// Card do clima atual: condição, temperatura, sensação, máx/mín e luz do dia

import clsx from 'clsx';
import WeatherIcon from './WeatherIcon';

export function HeroCard({
  badge = 'Condição atual',
  condition,
  description,
  temp,
  unit = '°C',
  feelsLike,
  max,
  min,
  daylight,
  comfort,
  weatherCode, // código WMO → escolhe a cena do <WeatherIcon>
  isDay = true, // dia: quadrado branco (mockup); noite: quadrado escuro
  icon, // opcional: um nó pronto que substitui o <WeatherIcon>
  className = '',
  ...props
}) {
  return (
    <article className={clsx('hero-card', className)} {...props}>
      {/* Brilhos desfocados do fundo (decorativos) */}
      <span className="hero-card__glow--blue" aria-hidden="true" />
      <span className="hero-card__glow--orange" aria-hidden="true" />

      {/* Topo: badge, condição e ícone */}
      <div className="hero-card__top">
        <div>
          <span className="hero-card__badge">
            <span className="hero-card__badge-dot" />
            {badge}
          </span>
          <h2 className="hero-card__condition">{condition}</h2>
          {description && <p className="hero-card__description">{description}</p>}
        </div>
        <div className={clsx('hero-card__icon', !isDay && 'hero-card__icon--night')}>
          {icon ?? <WeatherIcon code={weatherCode} isDay={isDay} size={64} title={condition} />}
        </div>
      </div>

      {/* Temperatura + sensação + máx/mín */}
      <div className="hero-card__readout">
        <p className="hero-card__temp">
          {temp}
          <span className="hero-card__temp-unit">{unit}</span>
        </p>
        <div className="hero-card__range">
          <span className="hero-card__feels">Sensação {feelsLike}°</span>
          <div className="hero-card__minmax">
            <span className="hero-card__max" title="Máxima">
              <span className="material-symbols-outlined">arrow_upward</span>
              {max}°
            </span>
            <span className="hero-card__divider">|</span>
            <span className="hero-card__min" title="Mínima">
              <span className="material-symbols-outlined">arrow_downward</span>
              {min}°
            </span>
          </div>
        </div>
      </div>

      {/* Faixa inferior */}
      <div className="hero-card__summary">
        {daylight && (
          <div className="hero-card__daylight">
            <span className="material-symbols-outlined">wb_sunny</span>
            <span>Luz do dia restante: {daylight}</span>
          </div>
        )}
        {comfort && <span className="hero-card__chip">{comfort}</span>}
      </div>
    </article>
  );
}

export default HeroCard;
