// ==========================================
// Components: estados da página (carregando, não encontrado, erro)
// ==========================================

import BentoGrid from '../layout/BentoGrid';
import Button from '../ui/Button';

const TILE_COUNT = 6;

// --- Carregando: esqueleto com o mesmo formato da página ---
export function LoadingState({ city }) {
  return (
    <div className="weather-state weather-state--loading" role="status" aria-live="polite">
      <span className="weather-state__sr-only">Carregando o clima de {city}…</span>

      <div className="weather-state__heading" aria-hidden="true">
        <span className="skeleton skeleton--title" />
        <span className="skeleton skeleton--line" />
      </div>

      <BentoGrid hero={<div className="skeleton skeleton--hero" />} aria-hidden="true">
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <div key={i} className="skeleton skeleton--tile" />
        ))}
      </BentoGrid>
    </div>
  );
}

// --- Mensagem centralizada (base dos estados de vazio/erro) ---
function StateMessage({ icon, title, children, action }) {
  return (
    <section className="weather-state weather-state--message">
      <span className="material-symbols-outlined weather-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h2 className="weather-state__title">{title}</h2>
      <p className="weather-state__text">{children}</p>
      {action}
    </section>
  );
}

// --- Nenhuma cidade encontrada (pedido do desafio) ---
export function NotFoundState({ query }) {
  return (
    <StateMessage icon="search_off" title="Nenhum resultado encontrado">
      Nenhum resultado encontrado para “{query}”. Confira a grafia ou tente outra cidade.
    </StateMessage>
  );
}

// --- Erro de rede/API, com botão para tentar de novo ---
export function ErrorState({ onRetry }) {
  return (
    <StateMessage
      icon="cloud_off"
      title="Algo deu errado"
      action={
        <Button variant="primary" iconLeft="refresh" label="Tentar novamente" onClick={onRetry} />
      }
    >
      Não conseguimos falar com o serviço de clima agora. Verifique sua conexão e tente de novo.
    </StateMessage>
  );
}
