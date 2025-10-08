// src/domain/entities/errors.ts

// Clase base para errores de servicios upstream
export class UpstreamServiceError extends Error {
  constructor(message: string, public readonly upstream: string) {
    super(message);
    this.name = 'UpstreamServiceError';
  }
}

// Errores específicos
export class CaretakerServiceError extends UpstreamServiceError {
  constructor(message = 'Caretaker service is unavailable') {
    super(message, 'caretaker');
    this.name = 'CaretakerServiceError';
  }
}

export class RoutinesServiceError extends UpstreamServiceError {
  constructor(message = 'Routines service is unavailable') {
    super(message, 'routines');
    this.name = 'RoutinesServiceError';
  }
}

export class UpstreamTimeoutError extends UpstreamServiceError {
  constructor(upstream: string) {
    super(`Timeout connecting to ${upstream} service`, upstream);
    this.name = 'UpstreamTimeoutError';
  }
}

export class InvalidPayloadError extends Error {
  constructor(public readonly details: string[]) {
    super('Invalid payload provided');
    this.name = 'InvalidPayloadError';
  }
}

// Error para propagar respuestas HTTP (ej. 404, 409) de un servicio
export class PropagatedError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly body: unknown
    ) {
        super('Propagated error from upstream service');
        this.name = 'PropagatedError';
    }
}