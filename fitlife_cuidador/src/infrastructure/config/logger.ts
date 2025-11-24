// src/infrastructure/config/logger.ts
import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

// 👇 OJO: firmas correctas: (req, res, err)
export const httpLogger = pinoHttp<IncomingMessage, ServerResponse>({
  logger,
  genReqId: (req, res) => {
    const idFromHeader = (req.headers["x-request-id"] as string) || undefined;
    const id = idFromHeader ?? randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (req, res, err) => {
    const code = res?.statusCode ?? 0;
    if (err) return "error";
    if (code >= 500) return "error";
    if (code >= 400) return "warn";
    return "info";
  },
  serializers: {
    req: (req) => ({
      id: (req as any).id,
      method: req.method,
      url: req.url,
      userAgent: req.headers["user-agent"],
      remoteAddress: req.socket?.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res?.statusCode ?? 0,
    }),
  },
  customSuccessMessage: (req, res) =>
    `${req.method} ${res?.statusCode ?? 0} ${req.url}`,
  customErrorMessage: (req, res, err) =>
    `ERROR ${req.method} ${res?.statusCode ?? 0} ${req.url} -> ${err?.message}`,
});
