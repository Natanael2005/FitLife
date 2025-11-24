// src/shared/utils/http.ts

import { env } from '../../infrastructure/config/env.js';
import { UpstreamTimeoutError } from '../../domain/entities/errors.js';

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  upstreamName: string,
  retries = env.RETRY_ATTEMPTS
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      // Devolvemos la respuesta para errores de cliente (4xx) y éxitos (2xx) para que el llamador decida qué hacer
      if (response.ok || (response.status >= 400 && response.status < 500) ) {
        return response;
      }
      // Si es un error de servidor (5xx) y es el último reintento, lanzamos el error
      if (i === retries) {
        throw new Error(`Upstream service ${upstreamName} failed with status ${response.status}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new UpstreamTimeoutError(upstreamName);
      }
      // Si es el último reintento, lanzamos el error original
      if (i === retries) {
        throw error;
      }
    }
    // Espera antes de reintentar (backoff exponencial opcional)
    await new Promise(res => setTimeout(res, 50 * Math.pow(2, i)));
  }
  // Esto teóricamente nunca se alcanza, pero es requerido por TypeScript
  throw new Error(`Failed to fetch from ${upstreamName} after ${retries} retries.`);
}