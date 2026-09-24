// ==========================================
// Store: localização ativa + cidades recentes
// ==========================================
// A localização exata do navegador fica apenas em memória. O middleware
// persiste exclusivamente as cidades nomeadas escolhidas pelo usuário.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const RECENT_LIMIT = 5;

function locationKey(location) {
  if (location.id != null) return `id:${location.id}`;
  return `coords:${Number(location.latitude).toFixed(4)},${Number(location.longitude).toFixed(4)}`;
}

export const useLocationsStore = create()(
  persist(
    (set) => ({
      activeLocation: null,
      recentLocations: [],

      setActiveLocation: (location) => set({ activeLocation: location }),
      clearActiveLocation: () => set({ activeLocation: null }),

      addRecentLocation: (location) =>
        set((state) => {
          if (!location?.name || !location.name.trim() || location.name === 'Minha localização') {
            return state;
          }
          const key = locationKey(location);
          const remaining = state.recentLocations.filter((item) => locationKey(item) !== key);
          return { recentLocations: [location, ...remaining].slice(0, RECENT_LIMIT) };
        }),

      clearRecentLocations: () => set({ recentLocations: [] }),
    }),
    {
      name: 'weather-now:recent-locations',
      version: 1,
      partialize: (state) => ({ recentLocations: state.recentLocations }),
    },
  ),
);

export default useLocationsStore;
