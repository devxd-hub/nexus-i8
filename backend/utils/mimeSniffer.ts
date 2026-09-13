/**
 * MIME Sniffer & Binary Content Validator
 * Validates actual file bytes (magic numbers) and prevents executable/malicious uploads.
 */

export interface MimeValidationResult {
  valid: boolean;
  detectedMime: string | null;
  sanitizedBuffer?: Buffer;
  error?: string;
  code?: string;
}

export const CATEGORY_LIMITS: Record<
  string,
  { allowedMimes: string[]; maxSizeBytes: number; label: string }
> = {
  projects: {
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    label: 'Project Images',
  },
  events: {
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    label: 'Event Photography',
  },
  members: {
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    label: 'Member Photos',
  },
  archive: {
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    maxSizeBytes: 15 * 1024 * 1024, // 15MB
    label: 'Archive Media',
  },
  resources: {
    allowedMimes: [
      'application/pdf',
      'application/zip',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
    ],
    maxSizeBytes: 25 * 1024 * 1024, // 25MB
    label: 'Resource Attachments',
  },
};

/**
 * Sniff binary magic numbers from buffer
 */
export function detectMimeFromBuffer(buffer: Buffer): string | null {
  if (!buffer || buffer.length < 4) return null;

  // 1. Check Executable Magic Numbers First (Hard Deny)
  // Windows MZ header (EXE / DLL / COM)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) return 'application/x-dosexec';
  // Linux ELF binary
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
    return 'application/x-executable';
  }
  // Java class / Mach-O fat binary: 0xCAFEBABE
  if (buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba && buffer[3] === 0xbe) {
    return 'application/x-java-applet';
  }
  // Mach-O binary: 0xFEEDFACE
  if (buffer[0] === 0xfe && buffer[1] === 0xed && buffer[2] === 0xfa && buffer[3] === 0xce) {
    return 'application/x-mach-binary';
  }
  // Shell script: #!
  if (buffer[0] === 0x23 && buffer[1] === 0x21) return 'text/x-shellscript';

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // 3. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // 4. GIF: GIF87a or GIF89a
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return 'image/gif';
  }

  // 5. WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  // 6. PDF: %PDF
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // 7. ZIP: PK\x03\x04
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return 'application/zip';
  }

  // 8. SVG: Text check for <svg
  const headerSample = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('utf8');
  if (headerSample.includes('<svg') && !headerSample.includes('<?php')) {
    return 'image/svg+xml';
  }

  return null;
}

/**
 * Sanitize SVG content against cross-site scripting (XSS), script tags, and event handlers
 */
export function sanitizeSvg(buffer: Buffer): { safe: boolean; sanitized?: Buffer; error?: string } {
  const content = buffer.toString('utf8');

  // Forbidden dangerous XML and script elements
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /\bon\w+\s*=/gi, // onclick=, onload=, onerror=, etc.
    /javascript\s*:/gi,
    /data:\s*text\/html/gi,
    /<!ENTITY/gi, // XXE injection
    /<!DOCTYPE/gi,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { safe: false, error: 'SVG contains disallowed executable scripts or event handlers' };
    }
  }

  return { safe: true, sanitized: buffer };
}

/**
 * Validates file upload against declared mime, magic bytes, category rules, and size limits
 */
export function validateMediaUpload(
  buffer: Buffer,
  originalFilename: string,
  category = 'projects'
): MimeValidationResult {
  const categoryConfig = CATEGORY_LIMITS[category] || CATEGORY_LIMITS.projects;

  // 1. File Size Validation
  if (buffer.length > categoryConfig.maxSizeBytes) {
    const maxMb = (categoryConfig.maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      detectedMime: null,
      error: `File size exceeds the maximum allowed limit of ${maxMb}MB for ${categoryConfig.label}`,
      code: 'FILE_TOO_LARGE',
    };
  }

  if (buffer.length === 0) {
    return {
      valid: false,
      detectedMime: null,
      error: 'File content cannot be empty',
      code: 'EMPTY_FILE',
    };
  }

  // 2. Dangerous Filename Extension Check
  const lowerName = originalFilename.toLowerCase();
  const dangerousExtensions = ['.exe', '.dll', '.sh', '.bat', '.cmd', '.php', '.phtml', '.js', '.vbs', '.py', '.rb'];
  if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
    return {
      valid: false,
      detectedMime: null,
      error: 'Executable and script file extensions are strictly forbidden',
      code: 'DANGEROUS_FILE_EXTENSION',
    };
  }

  // 3. Magic Number Validation
  const detectedMime = detectMimeFromBuffer(buffer);
  if (!detectedMime) {
    return {
      valid: false,
      detectedMime: null,
      error: 'Unable to verify file signature. The file format is unsupported or corrupted.',
      code: 'UNRECOGNIZED_FILE_SIGNATURE',
    };
  }

  // 4. Hard Deny on Executables Disguised as Images
  if (
    detectedMime === 'application/x-dosexec' ||
    detectedMime === 'application/x-executable' ||
    detectedMime === 'text/x-shellscript'
  ) {
    return {
      valid: false,
      detectedMime,
      error: 'Security violation: Executable binaries cannot be uploaded.',
      code: 'EXECUTABLE_REJECTED',
    };
  }

  // 5. Category Allowed MIME Check
  if (!categoryConfig.allowedMimes.includes(detectedMime)) {
    return {
      valid: false,
      detectedMime,
      error: `MIME type '${detectedMime}' is not permitted for category '${category}'. Allowed: ${categoryConfig.allowedMimes.join(', ')}`,
      code: 'MIME_NOT_ALLOWED',
    };
  }

  // 6. SVG XSS Sanitization
  if (detectedMime === 'image/svg+xml') {
    const svgResult = sanitizeSvg(buffer);
    if (!svgResult.safe) {
      return {
        valid: false,
        detectedMime,
        error: svgResult.error || 'Malicious SVG payload rejected',
        code: 'MALICIOUS_SVG',
      };
    }
    return {
      valid: true,
      detectedMime,
      sanitizedBuffer: svgResult.sanitized,
    };
  }

  return {
    valid: true,
    detectedMime,
    sanitizedBuffer: buffer,
  };
}
