// ==========================================
// Components: rodapés dos MetricTiles (React)
// ==========================================
// Peças reaproveitáveis passadas como children do <MetricTile>

import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { accentVariants } from './accentColors';

// Preenchimento da barra de progresso: uma cor do map $accent-colors
const progressFillVariants = cva('progress-bar__fill', {
  variants: {
    color: accentVariants('progress-bar__fill'),
  },
  defaultVariants: {
    color: 'blue',
  },
});

// Segmento da barra segmentada: cores de acento + 'muted' (cinza, só existe aqui)
const segmentVariants = cva('segment-bar__segment', {
  variants: {
    color: {
      ...accentVariants('segment-bar__segment'),
      muted: 'segment-bar__segment--muted',
    },
  },
});

// --- Faixa com dois lados; `emphasis` destaca um deles em branco/negrito ---
export function TileStrip({ left, right, emphasis = 'none', icon, iconRotation = 0 }) {
  return (
    <div className="tile-strip">
      <span className={clsx('tile-strip__side', emphasis === 'left' && 'tile-strip__em')}>
        {icon && (
          <span
            className="material-symbols-outlined tile-strip__icon"
            style={{ '--icon-rotation': `${iconRotation}deg` }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {left}
      </span>
      {right && (
        <span className={clsx('tile-strip__side', emphasis === 'right' && 'tile-strip__em')}>
          {right}
        </span>
      )}
    </div>
  );
}

// --- Legenda de duas pontas (usada abaixo das barras) ---
function TileCaption({ left, right }) {
  if (!left && !right) return null;
  return (
    <div className="tile-caption">
      <span>{left}</span>
      {right && <span className="tile-caption__em">{right}</span>}
    </div>
  );
}

// --- Barra de progresso: `percent` de 0 a 100 ---
export function ProgressBar({ percent = 0, color = 'blue', left, right }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="progress-bar">
      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={progressFillVariants({ color })}
          style={{ '--progress': `${clamped}%` }}
        />
      </div>
      <TileCaption left={left} right={right} />
    </div>
  );
}

// --- Barra segmentada: `segments` = lista de cores (ex.: ['blue', 'orange', 'muted']) ---
export function SegmentBar({ segments = [], caption }) {
  return (
    <div className="segment-bar">
      <div className="segment-bar__track" aria-hidden="true">
        {segments.map((color, i) => (
          <div key={i} className={segmentVariants({ color })} />
        ))}
      </div>
      <TileCaption left={caption} />
    </div>
  );
}

// --- Arco solar: SVG do mockup + nascer / zênite / pôr do sol ---
export function SolarArc({ sunrise, zenith, sunset }) {
  return (
    <div className="solar-arc">
      <svg className="solar-arc__graphic" viewBox="0 0 160 55" aria-hidden="true">
        {/* Linha do horizonte tracejada */}
        <line x1="10" x2="150" y1="50" y2="50" stroke="#3C3B5E" strokeDasharray="3 3" strokeWidth="1.5" />
        {/* Arco completo */}
        <path d="M 15 50 A 65 38 0 0 1 145 50" fill="none" stroke="#302F4A" strokeWidth="3" />
        {/* Trecho já percorrido */}
        <path
          d="M 15 50 A 65 38 0 0 1 118 20"
          fill="none"
          stroke="#FF7A0A"
          strokeLinecap="round"
          strokeWidth="3.5"
        />
        {/* Posição atual do sol */}
        <g className="solar-arc__sun">
          <circle cx="118" cy="20" r="9" fill="#FF7A0A" opacity="0.4" />
          <circle cx="118" cy="20" r="5" fill="#f87500" />
        </g>
      </svg>

      <div className="solar-arc__footer">
        <span className="solar-arc__time" title="Nascer do sol">
          <span className="material-symbols-outlined metric-tile__icon--secondary">wb_twilight</span>
          {sunrise}
        </span>
        <span className="solar-arc__zenith">Zênite {zenith}</span>
        <span className="solar-arc__time" title="Pôr do sol">
          <span className="material-symbols-outlined metric-tile__icon--orange">nights_stay</span>
          {sunset}
        </span>
      </div>
    </div>
  );
}
