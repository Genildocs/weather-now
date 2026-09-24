# Weather Now

Solução do desafio [Weather app](https://www.frontendmentor.io/) do Frontend Mentor, com o visual expandido a partir de um mockup gerado no Google Stitch (`mockup/code.html`). Os dados vêm da [Open-Meteo](https://open-meteo.com/), gratuita e sem chave de API.

## Funcionalidades

- [x] Busca de cidade (geocoding da Open-Meteo), com a cidade na URL (`?city=Berlin`)
- [x] Clima atual: temperatura, sensação, condição, máx/mín, ícone animado com dia/noite
- [x] Métricas: vento (direção e rajadas), umidade e ponto de orvalho, precipitação, UV, qualidade do ar (IQA europeu), arco solar
- [x] Previsão por hora com seletor de dia e abas 12h / 24h / Vento
- [x] Previsão de 7 dias com faixa térmica da semana, ligada à previsão por hora
- [x] Unidades individuais (°C/°F, km/h/mph, mm/in) em um dropdown, salvas no navegador
- [x] Estados de carregamento, "nenhum resultado" e erro com nova tentativa
- [x] Layout mobile-first, navegação por teclado e `prefers-reduced-motion`

## Stack

- **React 19** + **Vite** (com React Compiler)
- **Sass** (Dart Sass, `@use`/`@forward`), classes globais em **BEM**
- **Zustand** com `persist` para as unidades
- **axios** para a Open-Meteo, **react-router-dom** para o estado na URL
- **clsx** + **class-variance-authority** para compor `className`

## Arquitetura do Sass

```
src/styles/
  _colors.scss, _typography.scss, _geometry.scss   tokens de design
  _variables.scss                                  hub: @forward dos tokens
  _mixins.scss                                     respond-to, card-surface, pill, flex-row, glow, status-dot
  _<componente>.scss                               um partial por bloco BEM
src/index.scss                                     entrypoint: @use de todos os partials
```

- `respond-to($bp)` usa um map de breakpoints (mobile-first, `min-width`) e dá `@error` quando a chave não existe.
- As cores de destaque vêm de um map (`$accent-colors`) que um `@each` transforma em modificadores (`__icon--blue`…). A mesma lista existe em `accentColors.js` para o `cva`.
- Os ícones do tempo são SVGs sem nenhum hex no JSX. As cores saem de um map Sass convertido em custom properties.

## Aprendizados

- **A visibilidade na Open-Meteo não tem parâmetro de unidade próprio: ela segue `precipitation_unit`.** Com `inch`, o valor vem em pés. O app lê `current_units.visibility` e converte a partir dela, para não errar em combinações mistas de unidades.
- **Os horários são agrupados por dia no fuso da cidade (`Intl`)**, e não no fuso do navegador.
- **Com o React Compiler, retornos de hook que contêm refs precisam ser desestruturados** (veja o comentário em `src/hooks/useMenu.js`).

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Em desenvolvimento, `/dev/icons` mostra a galeria de todos os ícones do tempo, de dia e de noite.

## Autor

Genildo — [@Genildocs](https://github.com/Genildocs)
