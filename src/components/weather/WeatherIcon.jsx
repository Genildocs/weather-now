// ==========================================
// Component: WeatherIcon (React)
// ==========================================
// Ícone de clima em SVG animado, montado a partir do código WMO.
// A cena (sol? nuvem? chuva?) vem de `getWeatherInfo(code).scene`
// (tabela em services/weatherCodes.js); aqui só decidimos ONDE cada peça
// fica no viewBox 64×64. Nenhuma cor mora no JSX: tudo vem das classes
// BEM `weather-icon__*` em styles/_weather-icon.scss.
//
// Atenção ao `transform`: no SVG, uma animação CSS de transform SOBRESCREVE
// o atributo transform do mesmo elemento. Por isso a posição fica num <g>
// de fora (<Place>) e a animação no elemento de dentro.

import clsx from 'clsx';
import { cva } from 'class-variance-authority';
import { getWeatherInfo } from '../../services/weatherCodes';

const iconVariants = cva('weather-icon', {
  variants: {
    animated: { true: 'weather-icon--animated', false: '' },
    // Noite = paleta pensada para fundo escuro (lua clara, neve branca)
    isDay: { true: 'weather-icon--day', false: 'weather-icon--night' },
  },
  defaultVariants: { animated: true, isDay: true },
});

// --- Peças (desenhadas em volta da origem ou em coordenadas do mockup) ---

// Posiciona uma peça: translate + escala opcional
function Place({ x = 0, y = 0, scale = 1, children }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>{children}</g>;
}

// 8 raios: um a cada 45°, do raio 15 ao 18.5 (centro na origem)
const RAYS = Array.from({ length: 8 }, (_, i) => {
  const angle = (Math.PI / 4) * i;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return { x1: 15 * cos, y1: 15 * sin, x2: 18.5 * cos, y2: 18.5 * sin };
});

function Sun() {
  return (
    <>
      <g className="weather-icon__sun-rays">
        {RAYS.map((ray, i) => (
          <line key={i} {...ray} />
        ))}
      </g>
      <circle className="weather-icon__sun" r="10" />
    </>
  );
}

// Lua crescente: círculo r=11 menos um círculo r=9 deslocado para cima/direita.
// Os dois pontos onde os círculos se cruzam foram calculados à mão.
function Moon() {
  return (
    <path
      className="weather-icon__moon"
      d="M-0.73 -10.98A11 11 0 1 0 10.66 2.7A9 9 0 0 1 -0.73 -10.98Z"
    />
  );
}

// Estrelinha de 4 pontas (só no céu limpo à noite)
function Star({ x, y, scale = 1 }) {
  return (
    <Place x={x} y={y} scale={scale}>
      <path
        className="weather-icon__star"
        d="M0 -3.5L0.8 -0.8L3.5 0L0.8 0.8L0 3.5L-0.8 0.8L-3.5 0L-0.8 -0.8Z"
      />
    </Place>
  );
}

// Sol de dia, lua de noite
function Celestial({ isDay }) {
  return isDay ? <Sun /> : <Moon />;
}

// Nuvem nas coordenadas do mockup (corpo em x 16–51, y 22–46).
// variant: 'main' (sombra + corpo), 'back' (só a silhueta, atrás), 'storm' (escura)
const CLOUD_OUTER =
  'M48 48H22C16.48 48 12 43.52 12 38C12 32.74 16.06 28.43 21.22 28.04C22.68 22.25 27.89 18 34 18C41.34 18 47.36 23.63 47.95 30.82C52.44 31.39 56 35.28 56 40C56 44.42 52.42 48 48 48Z';
const CLOUD_INNER =
  'M46 46H24C19.58 46 16 42.42 16 38C16 33.79 19.25 30.34 23.38 30.03C24.54 25.4 28.71 22 33.6 22C39.47 22 44.29 26.5 44.76 32.26C48.35 32.72 51.2 35.83 51.2 39.6C51.2 43.13 48.34 46 46 46Z';

function Cloud({ variant = 'main' }) {
  if (variant === 'back') {
    return (
      <g className="weather-icon__cloud weather-icon__cloud--back">
        <path className="weather-icon__cloud-body" d={CLOUD_OUTER} />
      </g>
    );
  }
  return (
    <g className={clsx('weather-icon__cloud', variant === 'storm' && 'weather-icon__cloud--storm')}>
      <path className="weather-icon__cloud-shadow" d={CLOUD_OUTER} />
      <path className="weather-icon__cloud-body" d={CLOUD_INNER} />
    </g>
  );
}

// Posições x das gotas/flocos embaixo da nuvem, por quantidade.
// Com raio (tempestade) o meio fica livre.
const SLOTS = {
  normal: { 2: [26, 38], 3: [22, 32, 42], 4: [19, 27, 35, 43] },
  storm: { 2: [20, 45], 3: [18, 24, 46], 4: [17, 23, 44, 50] },
};
// Linhas alternadas em alturas diferentes pra não parecer um pente
const slotY = (i) => (i % 2 === 0 ? 42 : 46);

function Drop({ x, y }) {
  return <line className="weather-icon__drop" x1={x} y1={y} x2={x - 2} y2={y + 6} />;
}

function Drizzle({ x, y }) {
  return <circle className="weather-icon__drizzle" cx={x} cy={y + 2} r="1.9" />;
}

// Floco: 3 traços cruzados (asterisco) centrados na origem
function Flake({ x, y }) {
  return (
    <Place x={x} y={y + 3}>
      <g className="weather-icon__flake">
        <line x1="0" y1="-3.2" x2="0" y2="3.2" />
        <line x1="-2.8" y1="-1.6" x2="2.8" y2="1.6" />
        <line x1="-2.8" y1="1.6" x2="2.8" y2="-1.6" />
      </g>
    </Place>
  );
}

function Hail({ x, y }) {
  return <circle className="weather-icon__hail" cx={x} cy={y + 2} r="2.2" />;
}

// Qual peça desenhar em cada posição. 'sleet' alterna gota e floco.
const PRECIP_PIECES = {
  rain: () => Drop,
  drizzle: () => Drizzle,
  snow: () => Flake,
  hail: () => Hail,
  sleet: (i) => (i % 2 === 0 ? Drop : Flake),
};

function Precipitation({ kind, amount = 3, storm = false }) {
  const xs = SLOTS[storm ? 'storm' : 'normal'][amount] ?? SLOTS.normal[3];
  const pickPiece = PRECIP_PIECES[kind];
  if (!pickPiece) return null;

  return (
    <g className={`weather-icon__precip weather-icon__precip--${kind}`}>
      {xs.map((x, i) => {
        const Piece = pickPiece(i);
        return <Piece key={i} x={x} y={slotY(i)} />;
      })}
    </g>
  );
}

function Fog() {
  return (
    <g className="weather-icon__fog">
      <line x1="14" y1="44" x2="46" y2="44" />
      <line x1="20" y1="50" x2="52" y2="50" />
      <line x1="12" y1="56" x2="40" y2="56" />
    </g>
  );
}

function Bolt() {
  return <path className="weather-icon__bolt" d="M35 34L26 47H32L28 59L40 43H33.5L37 34Z" />;
}

// --- Montagem da cena ---

// Onde fica o sol/lua em cada tipo de cena (x, y, escala)
const CELESTIAL_PLACE = {
  full: { x: 32, y: 32, scale: 1.35 },
  few: { x: 27, y: 27, scale: 1.2 },
  behind: { x: 26, y: 24, scale: 1.2 }, // igual ao mockup (r = 12)
  peek: { x: 19, y: 13, scale: 0.75 },
};

function Scene({ scene, isDay }) {
  const { celestial, clouds, precip, amount, fog, bolt } = scene;
  // Com algo caindo embaixo, a nuvem sobe 10 unidades pra abrir espaço
  const cloudY = precip || fog || bolt ? -10 : 0;

  return (
    <>
      {/* Estrelas: só no céu limpo/quase limpo à noite */}
      {!isDay && (celestial === 'full' || celestial === 'few') && (
        <g className="weather-icon__stars">
          <Star x={12} y={14} />
          <Star x={52} y={12} scale={0.8} />
          <Star x={50} y={50} scale={0.7} />
        </g>
      )}

      {celestial && (
        <Place {...CELESTIAL_PLACE[celestial]}>
          <Celestial isDay={isDay} />
        </Place>
      )}

      {clouds === 'overcast' && (
        <Place x={-8} y={-10} scale={0.85}>
          <Cloud variant="back" />
        </Place>
      )}

      {clouds === 'small' && (
        <Place x={27} y={25} scale={0.6}>
          <Cloud />
        </Place>
      )}

      {(clouds === 'main' || clouds === 'overcast' || clouds === 'storm') && (
        <Place y={cloudY + (clouds === 'overcast' ? 4 : 0)}>
          <Cloud variant={clouds === 'storm' ? 'storm' : 'main'} />
        </Place>
      )}

      {fog && <Fog />}
      {bolt && <Bolt />}
      {precip && <Precipitation kind={precip} amount={amount} storm={bolt} />}
    </>
  );
}

export function WeatherIcon({
  code,
  isDay = true,
  size = 64,
  animated = true,
  title,
  className = '',
  ...props
}) {
  const { scene } = getWeatherInfo(code);

  return (
    <svg
      className={clsx(iconVariants({ animated, isDay }), className)}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // Com título vira uma imagem com nome; sem título é decorativo
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      <Scene scene={scene} isDay={isDay} />
    </svg>
  );
}

export default WeatherIcon;
