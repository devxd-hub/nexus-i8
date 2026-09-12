import { Request, Response, NextFunction } from 'express';

export function spamProtection(req: Request, res: Response, next: NextFunction): void {
  const body = req.body || {};

  // 1. Honeypot check: Bots usually fill all hidden inputs
  const honeypotFields = ['_nexus_hp', 'website', 'fax_number'];
  for (const field of honeypotFields) {
    if (body[field] && typeof body[field] === 'string' && body[field].trim().length > 0) {
      res.status(400).json({
        data: null,
        meta: null,
        error: {
          code: 'SPAM_DETECTED',
          message: 'Automated submission rejected.',
        },
      });
      return;
    }
  }

  // 2. Excessive hyperlink flooding check in messages
  const message = body.message || body.body || '';
  if (typeof message === 'string') {
    const urlMatches = message.match(/https?:\/\/[^\s]+/gi);
    if (urlMatches && urlMatches.length > 5) {
      res.status(400).json({
        data: null,
        meta: null,
        error: {
          code: 'SPAM_DETECTED',
          message: 'Submission rejected due to excessive hyperlinks.',
        },
      });
      return;
    }
  }

  next();
}

/**
 * Basic HTML tag sanitization for text inputs to prevent stored XSS
 */
export function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
