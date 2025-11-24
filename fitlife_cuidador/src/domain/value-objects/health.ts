export type Nivel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
export type Impacto = 'BAJO' | 'MEDIO' | 'ALTO';

export const NivelRank: Record<Nivel, number> = {
  PRINCIPIANTE: 1,
  INTERMEDIO: 2,
  AVANZADO: 3,
};

export function allowedImpactsByIMC(imc: number): Set<Impacto> {
  if (imc >= 35) return new Set<Impacto>(['BAJO']);
  if (imc >= 30) return new Set<Impacto>(['BAJO', 'MEDIO']);
  if (imc >= 25) return new Set<Impacto>(['BAJO', 'MEDIO']);
  if (imc < 18.5) return new Set<Impacto>(['BAJO', 'MEDIO']);
  return new Set<Impacto>(['BAJO', 'MEDIO', 'ALTO']);
}

export const slugifyToken = (t: string) => t.trim().toLowerCase();

export const normalizeToken = (s: string) =>
  s?.trim().replace(/\s+/g, '_').toUpperCase();