# Guia Prático de Sass / SCSS

Guia de referência rápido e moderno baseado na documentação oficial ([sass-lang.com/guide](https://sass-lang.com/guide/)), focado em **SCSS** e nas práticas modernas do Sass.

---

## Sumário
1. [Sintaxes: SCSS vs Sass](#1-sintaxes-scss-vs-sass)
2. [Como funciona no Vite (Neste projeto)](#2-como-funciona-no-vite-neste-projeto)
3. [Variáveis (`$`)](#3-variáveis-)
4. [Aninhamento (*Nesting*) e Seletor Pai (`&`)](#4-aninhamento-nesting-e-seletor-pai-)
5. [Partials (`_arquivo.scss`)](#5-partials-_arquivoscss)
6. [Módulos Modernos (`@use` e `@forward`)](#6-módulos-modernos-use-e-forward)
   - *Importante: `@import` está obsoleto!*
7. [Mixins (`@mixin` e `@include`)](#7-mixins-mixin-e-include)
8. [Herança (*Inheritance*) e Placeholders (`@extend` e `%`)](#8-herança-inheritance-e-placeholders-extend-e-)
9. [Operadores e Matemática (`sass:math`)](#9-operadores-e-matemática-sassmath)
10. [Módulos Embutidos Úteis (`sass:color`, `sass:map`, etc.)](#10-módulos-embutidos-úteis)
11. [Sugestão de Estrutura de Pastas](#11-sugestão-de-estrutura-de-pastas)

---

## 1. Sintaxes: SCSS vs Sass

O Sass oferece duas sintaxes:
- **SCSS (`.scss`)**: Extensão direta do CSS. Usa chaves `{}` e ponto e vírgula `;`. Qualquer código CSS válido é um código SCSS válido. **(Recomendada e a mais utilizada)**.
- **Sass Indentado (`.sass`)**: Sintaxe clássica que usa indentação em vez de chaves e quebras de linha em vez de ponto e vírgula.

---

## 2. Como funciona no Vite (Neste projeto)

No Vite, não é necessário configurar plugins para o Sass. Basta ter a dependência `sass` instalada no `package.json`:

```bash
npm install -D sass
```

Ao importar um arquivo `.scss` no seu código JavaScript:
```javascript
// src/main.js
import './style.scss';
```
O Vite detecta e compila automaticamente para CSS com suporte a Hot Module Replacement (HMR).

---

## 3. Variáveis (`$`)

Permitem armazenar cores, fontes, espaçamentos ou qualquer valor CSS que você deseje reutilizar.

```scss
// Declaração com o prefixo $
$primary-color: #aa3bff;
$font-stack: 'DM Sans', system-ui, sans-serif;
$spacing-md: 16px;

body {
  font-family: $font-stack;
  color: $primary-color;
  padding: $spacing-md;
}
```

---

## 4. Aninhamento (*Nesting*) e Seletor Pai (`&`)

Evita repetição de seletores e reflete visualmente a hierarquia do HTML.

### Aninhamento Básico:
```scss
nav {
  background-color: #333;
  padding: 1rem;

  ul {
    margin: 0;
    list-style: none;
  }

  li {
    display: inline-block;
  }

  a {
    color: #fff;
    text-decoration: none;
  }
}
```

### O caractere `&` (Referência ao Seletor Pai):
O `&` referencia exatamente o seletor externo, ideal para pseudo-classes, pseudo-elementos e padrão BEM:

```scss
.btn {
  background-color: $primary-color;
  color: white;

  // Pseudo-classes
  &:hover {
    background-color: darken($primary-color, 10%);
  }

  &:active {
    transform: scale(0.98);
  }

  // Modificador BEM (.btn--large)
  &--large {
    padding: 12px 24px;
    font-size: 1.25rem;
  }

  // Com elemento filho direto ou contexto
  body.dark-mode & {
    background-color: #222;
  }
}
```

> ⚠️ **Dica**: Evite aninhar mais de 3 níveis de profundidade para manter a especificidade do CSS controlada.

---

## 5. Partials (`_arquivo.scss`)

Um *partial* é um arquivo Sass cujo nome começa com sublinhado (`_`). Ele serve para ser importado por outros arquivos e **não** é compilado isoladamente para um arquivo CSS final.

Exemplo:
- `src/styles/_variables.scss`
- `src/styles/_mixins.scss`
- `src/styles/_buttons.scss`

---

## 6. Módulos Modernos (`@use` e `@forward`)

> 🚨 **O que mudou se você usava Sass antigamente:**  
> A diretiva `@import` clássica foi **descontinuada** (deprecated) devido a problemas de escopo global e importações duplicadas.  
> O Sass agora adota o sistema de módulos com **`@use`** e **`@forward`**.

### Usando `@use`:
Arquivos carregados via `@use` possuem **namespace** próprio (por padrão, o nome do arquivo sem o sublinhado).

```scss
// _variables.scss
$primary: #6366f1;
$radius: 8px;
```

```scss
// style.scss
@use 'variables';

.card {
  background-color: variables.$primary; // Acesso via namespace
  border-radius: variables.$radius;
}
```

#### Customizando ou removendo namespace:
```scss
// Com namespace personalizado:
@use 'variables' as vars;
.card { border-radius: vars.$radius; }

// Sem namespace (importa tudo diretamente no escopo local, se necessário):
@use 'variables' as *;
.card { border-radius: $radius; }
```

### Reexportando com `@forward`:
Ideal para arquivos agregadores (ex: um `_index.scss` que reúne todos os componentes ou utilitários):

```scss
// styles/base/_index.scss
@forward 'reset';
@forward 'typography';
```

E no seu arquivo principal:
```scss
@use 'base'; // Carrega tanto reset quanto typography
```

---

## 7. Mixins (`@mixin` e `@include`)

Mixins empacotam regras CSS reutilizáveis. Podem receber argumentos e valores padrão.

### Mixin simples e com argumentos:
```scss
// Definição
@mixin flex-center($direction: row) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: $direction;
}

// Uso
.header-hero {
  @include flex-center(column);
  height: 200px;
}
```

### Mixins para Media Queries com `@content`:
O bloco `@content` permite injetar regras personalizadas dentro do mixin:

```scss
@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}

.container {
  width: 1200px;

  @include mobile {
    width: 100%;
    padding: 0 16px;
  }
}
```

---

## 8. Herança (*Inheritance*) e Placeholders (`@extend` e `%`)

O `@extend` compartilha propriedades entre seletores. O uso com seletores de placeholder (`%placeholder`) garante que a classe só seja gerada no CSS se for estendida por alguém.

```scss
// Placeholder: não gera CSS sozinho
%btn-base {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
}

.btn-primary {
  @extend %btn-base;
  background-color: #0070f3;
  color: white;
}

.btn-danger {
  @extend %btn-base;
  background-color: #e00;
  color: white;
}
```

---

## 9. Operadores e Matemática (`sass:math`)

O Sass suporta operações matemáticas (`+`, `-`, `*`, `%`), mas atenção à **divisão (`/`)**:

> ⚠️ Em versões modernas do Sass, o operador `/` para divisão foi descontinuado (já que `/` é usado como separador nativo no CSS, ex: `font: 16px/1.5`). Use o módulo `sass:math`.

```scss
@use 'sass:math';

.container {
  // Maneira moderna:
  width: math.div(600px, 2); // 300px
  margin-top: 10px + 15px;    // 25px
  height: 50px * 2;           // 100px
}
```

---

## 10. Módulos Embutidos Úteis

O Sass traz módulos nativos modernos carregados via `@use`:

### Cores (`sass:color`):
```scss
@use 'sass:color';

$base-color: #3b82f6;

.button {
  background-color: $base-color;

  &:hover {
    // Substitui o antigo darken()
    background-color: color.adjust($base-color, $lightness: -10%);
  }

  &.translucent {
    // Altera opacidade
    background-color: color.adjust($base-color, $alpha: -0.3);
  }
}
```

### Mapas (`sass:map`):
```scss
@use 'sass:map';

$theme-colors: (
  'primary': #0d6efd,
  'secondary': #6c757d,
  'success': #198754
);

.badge-success {
  background-color: map.get($theme-colors, 'success');
}
```

---

## 11. Sugestão de Estrutura de Pastas

Para manter seus estilos limpos e escaláveis à medida que o app cresce:

```
src/
├── assets/
├── styles/
│   ├── _variables.scss      # Cores, espaçamentos, tipografia
│   ├── _mixins.scss         # Mixins e helpers
│   ├── _reset.scss          # Reset CSS
│   └── _components.scss     # Estilos de componentes
├── style.scss               # Arquivo principal que importa com @use
└── main.js
```

No `src/style.scss`:
```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;
@use 'styles/reset';
@use 'styles/components';
```
