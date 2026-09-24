# Weather Now

Solução do desafio [Weather app](https://www.frontendmentor.io/) do Frontend Mentor, com o visual expandido a partir de um mockup gerado no Google Stitch (`mockup/code.html`). Os dados meteorológicos vêm da [Open-Meteo](https://open-meteo.com/), gratuita e sem necessidade de chave de API.

---

## Funcionalidades

- [x] **Busca preditiva de cidades**: Autocomplete em tempo real com debounce, navegação fluida por teclado (setas, Enter, Esc) e geocoding da Open-Meteo.
- [x] **Localizador GPS inteligente**: Detecção de localização via Geolocation API com geocoding reverso automático (BigDataCloud + Open-Meteo), resolvendo o nome real do município.
- [x] **URL como fonte da verdade**: Suporte completo a navegação com estado na URL (`?city=Rio+de+Janeiro&lat=-22.9064&lon=-43.1822`), preservando o clima ao recarregar (F5), navegar no histórico (voltar/avançar) ou compartilhar links.
- [x] **Histórico de cidades recentes**: Cidades buscadas e localizações confirmadas salvas automaticamente em store local (Zustand com persistência).
- [x] **Atalhos de teclado contextuais**: Foco no campo de busca via `Ctrl K` (Linux/Windows) ou `⌘K` (macOS), com seleção automática do texto existente e ocultação dinâmica da dica durante a busca.
- [x] **Clima atual detalhado**: Temperatura, sensação térmica, condição climática, máxima e mínima, ícone animado com alternância dia/noite.
- [x] **Métricas meteorológicas**: Vento (velocidade, direção em graus e rajadas), umidade e ponto de orvalho, precipitação acumulada e probabilidade, índice UV, qualidade do ar (IQA europeu) e arco solar com horários de nascer, zênite e pôr do sol.
- [x] **Previsão por hora**: Seletor de dia e abas de visualização 12h, 24h e vento.
- [x] **Previsão semanal (7 dias)**: Faixa térmica da semana sincronizada com a previsão detalhada por hora.
- [x] **Personalização de unidades**: Alternância independente (°C/°F, km/h/mph, mm/in) em menu dropdown, com persistência no `localStorage`.
- [x] **Resiliência e UX**: Estados de carregamento com esqueletos, tratamento de erros de rede ou permissão de localização com retry, layout 100% responsivo mobile-first e respeito a `prefers-reduced-motion`.

---

## Stack Tecnológica

- **React 19** + **Vite** (com React Compiler)
- **Sass (Dart Sass)**: Arquitetura modular (`@use` / `@forward`), tokens de geometria, cores e tipografia, convenção BEM
- **Zustand**: Gerenciamento de estado com middleware `persist` para unidades e histórico de cidades
- **Axios**: Cliente HTTP para consultas à Open-Meteo e serviços de geocoding
- **React Router Dom**: Gerenciamento de rotas e sincronização de query params na URL
- **Class-variance-authority (CVA) + Clsx**: Composição segura e limpa de classes utilitárias

---

## Arquitetura de Estilos (Sass)

```
src/styles/
  _colors.scss, _typography.scss, _geometry.scss   Tokens do Design System (cores, fontes, espaçamentos)
  _variables.scss                                  Hub central: @forward de todos os tokens
  _mixins.scss                                     Mixins (respond-to, card-surface, pill, flex-row, glow)
  _<componente>.scss                               Módulos de estilo por componente BEM
src/index.scss                                     Entrypoint: @use de todos os partials
```

- **Responsividade**: Mixin `respond-to($bp)` baseado em mapas de breakpoints móveis (`tablet: 768px`, `desktop: 1200px`, `wide: 1440px`).
- **Paleta Temática**: Ícones e status atmosféricos utilizam paletas customizadas calculadas com funções nativas do Sass (`sass:color`).

---

## Aprendizados e Decisões de Arquitetura

- **Visibilidade na Open-Meteo**: Não há parâmetro isolado para visibilidade; ela acompanha a unidade de precipitação (`precipitation_unit`). Em polegadas, a visibilidade é expressa em pés. A aplicação inspeciona `current_units.visibility` e realiza a conversão precisa para evitar inconsistências em combinações mistas de unidades.
- **Fusos Horários Dinâmicos**: Todos os horários e previsões são processados e formatados no fuso horário nativo da cidade informada pela API via `Intl.DateTimeFormat`, em vez do fuso local do navegador do usuário.
- **Cache por Coordenadas no `useWeather`**: O `targetKey` de consulta meteorológica utiliza a assinatura geográfica `coords:lat,lon` para evitar requisições redundantes quando o rótulo do nome da cidade for enriquecido por geocoding reverso.
- **Geocoding Reverso Híbrido e Resiliente**: Combinação da API BigDataCloud com a canonização de metadados da Open-Meteo para resolver o nome canônico do município com validação de proximidade geográfica (~150km).

---

## Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm

### Instalação e Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (http://localhost:5173)
npm run dev

# Executar suite de testes automatizados (unitários e E2E via Chromium)
npm test

# Executar validação de código (linting)
npm run lint

# Gerar build de produção
npm run build
```

---

## Rotas de Desenvolvimento

- `/`: Aplicação principal
- `/dev/icons`: Galeria interativa de todos os ícones atmosféricos do sistema nos modos diurno e noturno.

---

## Autor

Genildo — [@Genildocs](https://github.com/Genildocs)
