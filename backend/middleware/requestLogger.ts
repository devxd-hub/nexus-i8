import { Request, Response, NextFunction } from 'express';

const SENSITIVE_QUERY_PARAMS = ['token', 'password', 'secret', 'key', 'auth', 'apikey'];

function redactUrl(originalUrl: string): string {
  try {
    const url = new URL(originalUrl, 'http://localhost');
    for (const param of SENSITIVE_QUERY_PARAMS) {
      if (url.searchParams.has(param)) {
        url.searchParams.set(param, '[REDACTED]');
      }
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return originalUrl;
  }
}

function maskIp(ip: string | undefined): string {
  if (!ip) return 'unknown';
  if (ip.includes('.')) {
    // IPv4: 192.168.1.10 -> 192.168.*.*
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.*.*`;
    }
  }
  if (ip.includes(':')) {
    // IPv6: truncate prefix
    return `${ip.split(':').slice(0, 2).join(':')}::*`;
  }
  return 'masked';
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const isProduction = process.env.NODE_ENV === 'production';

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;
    const sanitizedUrl = redactUrl(req.originalUrl);
    const requestId = req.id || (res.getHeader('X-Request-Id') as string) || 'unknown';

    if (isProduction) {
      const forwarded = req.headers['x-forwarded-for'];
      const rawIp =
        typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : req.ip || req.socket.remoteAddress;

      const logEntry = {
        timestamp: new Date().toISOString(),
        level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
        requestId,
        method: req.method,
        url: sanitizedUrl,
        statusCode,
        durationMs,
        clientIp: maskIp(rawIp),
      };
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[HTTP] ${req.method} ${sanitizedUrl} ${statusCode} - ${durationMs}ms (id: ${requestId})`);
    }
  });

  next();
}
