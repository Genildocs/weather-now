// ==========================================
// Store: Unidades de medida (Zustand)
// ==========================================
// Os valores são EXATAMENTE os parâmetros da Open-Meteo:
// temperature_unit, wind_speed_unit, precipitation_unit.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Opções por categoria: label da categoria + opções { value, label }.
// Serve tanto para validar setUnit quanto para montar o dropdown.
export const UNIT_OPTIONS = {
  temperature: {
    label: 'Temperatura',
    options: [
      { value: 'celsius', label: 'Celsius (°C)' },
      { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
    ],
  },
  windSpeed: {
    label: 'Velocidade do vento',
    options: [
      { value: 'kmh', label: 'km/h' },
      { value: 'mph', label: 'mph' },
    ],
  },
  precipitation: {
    label: 'Precipitação',
    options: [
      { value: 'mm', label: 'Milímetros (mm)' },
      { value: 'inch', label: 'Polegadas (in)' },
    ],
  },
};

// Presets de sistema: cada um define as três unidades de uma vez
const SYSTEMS = {
  metric: { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' },
  imperial: { temperature: 'fahrenheit', windSpeed: 'mph', precipitation: 'inch' },
};

// true se a categoria existe e o valor é uma das opções dela
function isValidUnit(key, value) {
  return UNIT_OPTIONS[key]?.options.some((option) => option.value === value) ?? false;
}

// Seletor derivado: 'metric' | 'imperial' | 'mixed' (combinação avulsa).
// Retorna string (primitivo), então pode ir direto em useUnitsStore(getSystem).
export function getSystem(state) {
  for (const [system, units] of Object.entries(SYSTEMS)) {
    const matches = Object.keys(units).every((key) => state[key] === units[key]);
    if (matches) return system;
  }
  return 'mixed';
}

// persist: salva o estado no localStorage e restaura ao recarregar a página.
// - name: chave usada no localStorage
// - version: se o formato mudar no futuro, sobe a versão e usa `migrate`
// - partialize: escolhe O QUE salvar (só os três valores, nunca as funções)
//
// Leitura nos componentes (Zustand v5): selecione valores atômicos,
//   const temperature = useUnitsStore((s) => s.temperature);
// ou, para pegar vários de uma vez num objeto, use `useShallow`
// (de 'zustand/react/shallow') — um seletor que cria objeto novo a cada
// render sem useShallow causa loop de re-render na v5.
export const useUnitsStore = create()(
  persist(
    (set) => ({
      ...SYSTEMS.metric, // padrão: métrico

      // Troca uma unidade; chave ou valor inválidos são ignorados
      setUnit: (key, value) => {
        if (!isValidUnit(key, value)) return;
        set({ [key]: value });
      },

      // Troca as três unidades de uma vez
      setSystem: (system) => {
        if (!SYSTEMS[system]) return;
        set({ ...SYSTEMS[system] });
      },
    }),
    {
      name: 'weather-now:units',
      version: 1,
      partialize: (state) => ({
        temperature: state.temperature,
        windSpeed: state.windSpeed,
        precipitation: state.precipitation,
      }),
    },
  ),
);

export default useUnitsStore;
