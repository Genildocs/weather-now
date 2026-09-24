// ==========================================
// Página de dev: galeria de ícones de clima (/dev/icons)
// ==========================================
// Mostra todas as cenas do <WeatherIcon>, de dia e de noite, com o código
// WMO embaixo. Só existe em `npm run dev` (a rota é registrada em main.jsx
// apenas quando import.meta.env.DEV é true, então não vai pro build).
// Os quadrados reaproveitam `.hero-card__icon` pra ficar igual ao card real.

import clsx from 'clsx';
import WeatherIcon from '../../components/weather/WeatherIcon';
import { getWeatherInfo, WEATHER_CODE_LIST } from '../../services/weatherCodes';

// Só layout aqui (sem cores): grade responsiva de cartões
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(10.5rem, 1fr))',
  gap: '1rem',
  padding: '1.5rem',
};
const cellStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' };
const pairStyle = { display: 'flex', gap: '0.5rem' };
const captionStyle = { fontSize: '0.75rem', textAlign: 'center' };

export default function IconsGallery() {
  return (
    <div style={gridStyle}>
      {WEATHER_CODE_LIST.map((code) => {
        const { label } = getWeatherInfo(code);
        return (
          <figure key={code} style={cellStyle}>
            <div style={pairStyle}>
              {[true, false].map((isDay) => (
                <div
                  key={String(isDay)}
                  className={clsx('hero-card__icon', !isDay && 'hero-card__icon--night')}
                >
                  <WeatherIcon
                    code={code}
                    isDay={isDay}
                    title={`${label} (${isDay ? 'dia' : 'noite'})`}
                  />
                </div>
              ))}
            </div>
            <figcaption style={captionStyle}>
              <strong>{code}</strong> · {label}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
