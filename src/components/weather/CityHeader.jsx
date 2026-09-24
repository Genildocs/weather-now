// ==========================================
// Component: CityHeader (React)
// ==========================================
// Faixa de telemetria (estação + controles) e cabeçalho da cidade com mini-cards

import clsx from 'clsx';
import StatChip from './StatChip';

// Separador "•" entre os trechos de texto (decorativo)
function Separator() {
  return (
    <span className="city-header__sep" aria-hidden="true">
      •
    </span>
  );
}

export function CityHeader({
  city,
  station,
  syncCycle,
  metar,
  dateLabel,
  timeLabel,
  updatedLabel,
  stats = [], // [{ icon, label, value }]
  hazardsLabel = 'Sem alertas severos',
  className = '',
  ...props
}) {
  return (
    <section className={clsx('city-header', className)} {...props}>
      {/* Linha 1: status da estação + cápsula de controles */}
      <div className="city-header__ribbon">
        <div className="city-header__status">
          <span className="city-header__live-dot" aria-hidden="true" />
          <span className="city-header__station">{station}</span>
          {syncCycle && (
            <>
              <Separator />
              <span className="city-header__sync">
                <span className="material-symbols-outlined" aria-hidden="true">
                  sync
                </span>
                {syncCycle}
              </span>
            </>
          )}
        </div>

        <div className="city-header__controls">
          <button type="button" className="city-header__control">
            <span className="material-symbols-outlined" aria-hidden="true">
              radar
            </span>
            <span>Radar ao vivo</span>
          </button>
          <span className="city-header__controls-divider" aria-hidden="true" />
          <button type="button" className="city-header__control city-header__control--alert">
            <span className="material-symbols-outlined" aria-hidden="true">
              bolt
            </span>
            <span>{hazardsLabel}</span>
          </button>
        </div>
      </div>

      {/* Linha 2: cidade + data/hora (esquerda) e mini-cards (direita) */}
      <header className="city-header__main">
        <div className="city-header__identity">
          <div className="city-header__title">
            <span className="material-symbols-outlined city-header__pin" aria-hidden="true">
              location_on
            </span>
            <h1 className="city-header__name">{city}</h1>
            {metar && <span className="city-header__metar">METAR: {metar}</span>}
          </div>

          <p className="city-header__meta">
            <span>{dateLabel}</span>
            <Separator />
            <span>{timeLabel}</span>
            {updatedLabel && (
              <>
                <Separator />
                <span className="city-header__updated">
                  <span className="city-header__updated-dot" aria-hidden="true" />
                  {updatedLabel}
                </span>
              </>
            )}
          </p>
        </div>

        {stats.length > 0 && (
          <ul className="city-header__stats">
            {stats.map((stat) => (
              <li key={stat.label}>
                <StatChip {...stat} />
              </li>
            ))}
          </ul>
        )}
      </header>
    </section>
  );
}

export default CityHeader;
