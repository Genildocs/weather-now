// ==========================================
// Códigos de tempo WMO → texto (pt-BR) + cena do ícone
// ==========================================
// Tabela oficial dos códigos: https://open-meteo.com/en/docs (seção "WMO Weather interpretation codes")
//
// `scene` descreve O QUE o <WeatherIcon> desenha (os dados); o COMO
// (coordenadas, cores, animações) fica no componente e no SCSS.
// Campos da cena (todos opcionais):
//   celestial: sol (dia) ou lua (noite)
//     'full'   → grande, no centro (céu limpo)
//     'few'    → grande, com nuvem pequena na frente
//     'behind' → atrás da nuvem, como no mockup
//     'peek'   → pequeno, espiando atrás de uma nuvem alta (chuva leve etc.)
//   clouds:  'small' | 'main' | 'overcast' (duas nuvens) | 'storm' (nuvem escura)
//   precip:  'drizzle' | 'rain' | 'snow' | 'sleet' (gota + floco) | 'hail'
//   amount:  quantas gotas/flocos (2 = fraca, 3 = moderada, 4 = forte)
//   fog:     linhas de névoa     bolt: raio
//
// | Código      | Condição                      | Cena                                  |
// |-------------|-------------------------------|---------------------------------------|
// | 0           | céu limpo                     | sol/lua grande (+ estrelas à noite)   |
// | 1           | predominantemente limpo       | sol/lua + nuvem pequena               |
// | 2           | parcialmente nublado          | sol/lua atrás da nuvem                |
// | 3           | encoberto                     | duas nuvens                           |
// | 45, 48      | nevoeiro                      | nuvem + névoa                         |
// | 51, 53      | garoa fraca/moderada          | sol/lua espiando + nuvem + garoa      |
// | 55          | garoa intensa                 | nuvem + garoa (4)                     |
// | 56, 57      | garoa congelante              | nuvem + gota/floco alternados         |
// | 61, 63, 65  | chuva fraca/moderada/forte    | nuvem + 2/3/4 gotas                   |
// | 66, 67      | chuva congelante              | nuvem + gota/floco alternados         |
// | 71, 73, 75  | neve fraca/moderada/forte     | nuvem + 2/3/4 flocos                  |
// | 77          | grãos de neve                 | nuvem + bolinhas de gelo              |
// | 80, 81, 82  | pancadas de chuva             | sol/lua espiando + nuvem + gotas      |
// | 85, 86      | pancadas de neve              | sol/lua espiando + nuvem + flocos     |
// | 95          | trovoada                      | nuvem escura + raio + gotas           |
// | 96, 99      | trovoada com granizo          | nuvem escura + raio + granizo         |
// | outro       | desconhecido                  | nuvem simples                         |

const WEATHER_CODES = {
  0: { label: 'Céu limpo', scene: { celestial: 'full' } },
  1: { label: 'Predominantemente limpo', scene: { celestial: 'few', clouds: 'small' } },
  2: { label: 'Parcialmente nublado', scene: { celestial: 'behind', clouds: 'main' } },
  3: { label: 'Encoberto', scene: { clouds: 'overcast' } },
  45: { label: 'Nevoeiro', scene: { clouds: 'main', fog: true } },
  48: { label: 'Nevoeiro com geada', scene: { clouds: 'main', fog: true } },
  51: {
    label: 'Garoa fraca',
    scene: { celestial: 'peek', clouds: 'main', precip: 'drizzle', amount: 2 },
  },
  53: {
    label: 'Garoa moderada',
    scene: { celestial: 'peek', clouds: 'main', precip: 'drizzle', amount: 3 },
  },
  55: { label: 'Garoa intensa', scene: { clouds: 'main', precip: 'drizzle', amount: 4 } },
  56: { label: 'Garoa congelante fraca', scene: { clouds: 'main', precip: 'sleet', amount: 2 } },
  57: { label: 'Garoa congelante intensa', scene: { clouds: 'main', precip: 'sleet', amount: 3 } },
  61: { label: 'Chuva fraca', scene: { clouds: 'main', precip: 'rain', amount: 2 } },
  63: { label: 'Chuva moderada', scene: { clouds: 'main', precip: 'rain', amount: 3 } },
  65: { label: 'Chuva forte', scene: { clouds: 'main', precip: 'rain', amount: 4 } },
  66: { label: 'Chuva congelante fraca', scene: { clouds: 'main', precip: 'sleet', amount: 3 } },
  67: { label: 'Chuva congelante forte', scene: { clouds: 'main', precip: 'sleet', amount: 4 } },
  71: { label: 'Neve fraca', scene: { clouds: 'main', precip: 'snow', amount: 2 } },
  73: { label: 'Neve moderada', scene: { clouds: 'main', precip: 'snow', amount: 3 } },
  75: { label: 'Neve forte', scene: { clouds: 'main', precip: 'snow', amount: 4 } },
  77: { label: 'Grãos de neve', scene: { clouds: 'main', precip: 'hail', amount: 3 } },
  80: {
    label: 'Pancadas de chuva fracas',
    scene: { celestial: 'peek', clouds: 'main', precip: 'rain', amount: 2 },
  },
  81: {
    label: 'Pancadas de chuva moderadas',
    scene: { celestial: 'peek', clouds: 'main', precip: 'rain', amount: 3 },
  },
  82: {
    label: 'Pancadas de chuva violentas',
    scene: { celestial: 'peek', clouds: 'main', precip: 'rain', amount: 4 },
  },
  85: {
    label: 'Pancadas de neve fracas',
    scene: { celestial: 'peek', clouds: 'main', precip: 'snow', amount: 2 },
  },
  86: {
    label: 'Pancadas de neve fortes',
    scene: { celestial: 'peek', clouds: 'main', precip: 'snow', amount: 4 },
  },
  95: { label: 'Trovoada', scene: { clouds: 'storm', bolt: true, precip: 'rain', amount: 2 } },
  96: {
    label: 'Trovoada com granizo fraco',
    scene: { clouds: 'storm', bolt: true, precip: 'hail', amount: 2 },
  },
  99: {
    label: 'Trovoada com granizo forte',
    scene: { clouds: 'storm', bolt: true, precip: 'hail', amount: 4 },
  },
};

const UNKNOWN = { label: 'Condição desconhecida', scene: { clouds: 'main' } };

// Lista dos códigos conhecidos (útil pra galeria de ícones em dev)
export const WEATHER_CODE_LIST = Object.keys(WEATHER_CODES).map(Number);

// getWeatherInfo(61) → { label: 'Chuva fraca', scene: { clouds: 'main', precip: 'rain', amount: 2 } }
export function getWeatherInfo(code) {
  return WEATHER_CODES[code] ?? UNKNOWN;
}
