// ==========================================
// Component: HeroCard (React)
// ==========================================
// Card do clima atual: condição, temperatura, sensação, máx/mín e luz do dia

import clsx from 'clsx';

// Ícone padrão (sol com nuvem) — SVG copiado do mockup
function SunCloudIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="26" cy="24" r="12" fill="#f87500" />
      <g className="hero-card__sun-rays" stroke="#ffb68c" strokeLinecap="round" strokeWidth="2.5">
        <line x1="26" x2="26" y1="6" y2="2" />
        <line x1="26" x2="26" y1="46" y2="42" />
        <line x1="8" x2="4" y1="24" y2="24" />
        <line x1="48" x2="44" y1="24" y2="24" />
        <line x1="13.27" x2="10.44" y1="11.27" y2="8.44" />
        <line x1="38.73" x2="41.56" y1="36.73" y2="39.56" />
        <line x1="13.27" x2="10.44" y1="36.73" y2="39.56" />
        <line x1="38.73" x2="41.56" y1="11.27" y2="8.44" />
      </g>
      <path
        d="M48 48H22C16.48 48 12 43.52 12 38C12 32.74 16.06 28.43 21.22 28.04C22.68 22.25 27.89 18 34 18C41.34 18 47.36 23.63 47.95 30.82C52.44 31.39 56 35.28 56 40C56 44.42 52.42 48 48 48Z"
        fill="#3C3B5E"
      />
      <path
        d="M46 46H24C19.58 46 16 42.42 16 38C16 33.79 19.25 30.34 23.38 30.03C24.54 25.4 28.71 22 33.6 22C39.47 22 44.29 26.5 44.76 32.26C48.35 32.72 51.2 35.83 51.2 39.6C51.2 43.13 48.34 46 46 46Z"
        fill="#4255DC"
      />
    </svg>
  );
}

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
  icon = <SunCloudIcon />,
  iconName = '', // nome de um Material Symbol (ex.: 'rainy'); se vier, substitui o SVG
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
        <div className="hero-card__icon">
          {iconName ? (
            <span className="material-symbols-outlined hero-card__symbol" aria-hidden="true">
              {iconName}
            </span>
          ) : (
            icon
          )}
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
