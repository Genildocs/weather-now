// ==========================================
// Component: StatChip (React)
// ==========================================
// Mini-card de telemetria: ícone à esquerda + label em cima + valor embaixo

import clsx from 'clsx';

export function StatChip({ icon, label, value, className = '', ...props }) {
  return (
    <div className={clsx('stat-chip', className)} {...props}>
      {icon && (
        <span className="material-symbols-outlined stat-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="stat-chip__text">
        <span className="stat-chip__label">{label}</span>
        <span className="stat-chip__value">{value}</span>
      </div>
    </div>
  );
}

export default StatChip;
