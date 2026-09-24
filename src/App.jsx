// ==========================================
// Layout do app: Header fixo + área principal com a página da rota
// ==========================================
// A página (ex.: HomePage) entra no <Outlet />.
// A cidade mora na URL (useWeatherParams): o Header só muda a URL e a
// página lê de lá. As unidades moram na store (o UnitsDropdown do Header
// escreve nela direto), então não passam por aqui.

import { Outlet } from 'react-router-dom';
import Header from './components/layout/Header';
import { useWeatherParams } from './hooks/useWeatherParams';

export default function App() {
  const { city, setCity } = useWeatherParams();

  return (
    <div className="app-container">
      <Header city={city} onSearch={setCity} />

      <main className="main-content">
        {/* Brilhos atmosféricos do fundo (decorativos) */}
        <span className="main-content__glow--blue" aria-hidden="true" />
        <span className="main-content__glow--orange" aria-hidden="true" />

        <Outlet />
      </main>
    </div>
  );
}
