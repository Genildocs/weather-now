// ==========================================
// Component: BentoGrid (React)
// ==========================================
// Slot `hero` = coluna da esquerda (5/12); `children` = tiles de métricas (7/12)

import clsx from 'clsx';

export function BentoGrid({ hero, children, className = '', ...props }) {
  return (
    <section className={clsx('bento-grid', className)} {...props}>
      {hero && <div className="bento-grid__hero">{hero}</div>}
      <div className="bento-grid__metrics">{children}</div>
    </section>
  );
}

export default BentoGrid;
