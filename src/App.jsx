// ==========================================
// Layout do app: Header fixo + área principal com a página da rota
// ==========================================
// A página (ex.: HomePage) entra no <Outlet />.
// Cidades nomeadas moram na URL; a localização exata do navegador fica
// somente na store em memória. As unidades vivem em outra store persistida.

import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import { useWeatherParams } from './hooks/useWeatherParams';

export default function App() {
  const { city, target, signature, setLocation } = useWeatherParams();

  function handleSelectLocation(location) {
    setLocation(location);
  }

  const locationName = target.kind === 'location' ? (target.location.name || '') : city;
  const locationKey = signature;

  return (
    <div className="app-container">
      <Header
        locationKey={locationKey}
        locationName={locationName}
        onSelectLocation={handleSelectLocation}
      />

      <main className="main-content">
        {/* Brilhos atmosféricos do fundo (decorativos) */}
        <span className="main-content__glow--blue" aria-hidden="true" />
        <span className="main-content__glow--orange" aria-hidden="true" />

        <Outlet />
      </main>
    </div>
  );
}
