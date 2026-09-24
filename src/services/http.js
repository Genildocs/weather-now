// ==========================================
// Clientes HTTP (axios) da Open-Meteo
// ==========================================
// Uma instância por serviço: cada uma já sabe a baseURL e o tempo limite.
// Nenhuma precisa de chave de API.

import axios from 'axios';

// 10s: tempo suficiente numa rede lenta sem deixar a tela "presa" pra sempre
const TIMEOUT_MS = 10_000;

export const geocodingApi = axios.create({
  baseURL: 'https://geocoding-api.open-meteo.com/v1',
  timeout: TIMEOUT_MS,
});

export const forecastApi = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: TIMEOUT_MS,
});

export const airQualityApi = axios.create({
  baseURL: 'https://air-quality-api.open-meteo.com/v1',
  timeout: TIMEOUT_MS,
});

// Re-exporta o verificador de cancelamento (AbortController → CanceledError)
export const isCanceled = axios.isCancel;
