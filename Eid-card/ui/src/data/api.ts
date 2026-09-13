import { TeamMember } from '../types';
import { normalizeMemberJson, teamMembers } from './members';

export type EidErrorType =
  | 'INVALID_ID'
  | 'NOT_FOUND'
  | 'SLUG_MISMATCH'
  | 'INACTIVE'
  | 'NETWORK_ERROR'
  | 'MALFORMED';

export interface EidError {
  type: EidErrorType;
  message: string;
  identifier?: string;
  correctSlug?: string;
  canonicalUrl?: string;
}

export interface FetchMemberResult {
  success: boolean;
  data?: TeamMember;
  error?: EidError;
}

const API_BASE =
  typeof window !== 'undefined' && window.location?.hostname
    ? '' // Use relative path (proxied by Vite)
    : 'http://localhost:3001';

/**
 * Validates whether an identifier conforms to the permanent NEXUS unique ID specification (NX-XXX).
 */
export function isStrictUniqueIdFormat(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^NX-[0-9]{3,}$/i.test(id.trim());
}

/**
 * Validates whether a general identifier is allowable (either strict unique ID or valid slug).
 */
export function isValidIdentifierFormat(identifier: string): boolean {
  if (!identifier || typeof identifier !== 'string') return false;
  const trimmed = identifier.trim();
  if (trimmed.length < 2 || trimmed.length > 64) return false;
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

/**
 * Primary API method to fetch a member's public E-ID card from the NEXUS backend.
 * 
 * Data Flow:
 * 1. Queries backend authoritatively by uniqueId.
 * 2. If an expectedSlug is provided (e.g. from /memberID/:slug/:uniqueId), validates
 *    that the returned member's registered slug matches the URL slug.
 * 3. Handles invalid formats, 404s, slug mismatches, inactive statuses, and network failures.
 */
export async function fetchMemberByIdentifier(
  identifier: string,
  expectedSlug?: string
): Promise<FetchMemberResult> {
  const cleanId = identifier?.trim();

  // 1. Format validation: If this is an NX identifier, check strict format
  if (cleanId.toUpperCase().startsWith('NX-') || cleanId.toUpperCase().startsWith('NX')) {
    if (!isStrictUniqueIdFormat(cleanId)) {
      return {
        success: false,
        error: {
          type: 'INVALID_ID',
          message: `"${cleanId}" is not a valid permanent NEXUS unique ID (expected format: NX-XXX).`,
          identifier: cleanId,
        },
      };
    }
  } else if (!isValidIdentifierFormat(cleanId)) {
    return {
      success: false,
      error: {
        type: 'INVALID_ID',
        message: 'Identifier format rejected. Expected NX-XXX or valid operative slug.',
        identifier: cleanId,
      },
    };
  }

  // 2. Query backend using uniqueId as the authoritative identifier
  const targetUrl = `${API_BASE}/api/eid/members/${encodeURIComponent(cleanId)}`;

  try {
    let res: Response;
    try {
      res = await fetch(targetUrl, {
        headers: { Accept: 'application/json' },
      });
    } catch (fetchErr) {
      // If relative URL failed (e.g. Vite proxy not active or running elsewhere), attempt direct backend port 3001
      if (API_BASE === '') {
        try {
          const directUrl = `http://localhost:3001${targetUrl}`;
          res = await fetch(directUrl, { headers: { Accept: 'application/json' } });
        } catch {
          throw fetchErr;
        }
      } else {
        throw fetchErr;
      }
    }

    // Handle 404 Not Found
    if (res.status === 404) {
      return {
        success: false,
        error: {
          type: 'NOT_FOUND',
          message: `The requested personnel identity "${cleanId}" does not exist in the NEXUS collective.`,
          identifier: cleanId,
        },
      };
    }

    // Handle 400 Bad Request
    if (res.status === 400) {
      return {
        success: false,
        error: {
          type: 'INVALID_ID',
          message: 'Invalid member identifier supplied.',
          identifier: cleanId,
        },
      };
    }

    // Handle server error
    if (!res.ok) {
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: `Backend service responded with HTTP status ${res.status}.`,
          identifier: cleanId,
        },
      };
    }

    // Parse JSON
    let body: any;
    try {
      body = await res.json();
    } catch {
      return {
        success: false,
        error: {
          type: 'MALFORMED',
          message: 'Received an invalid or unparseable response from the identity service.',
          identifier: cleanId,
        },
      };
    }

    // Validate payload schema
    const rawData = body?.data || body;
    if (!rawData || typeof rawData !== 'object' || (!rawData.uniqueId && !rawData.id && !rawData.name)) {
      return {
        success: false,
        error: {
          type: 'MALFORMED',
          message: 'Member data record is corrupted or missing required identity fields.',
          identifier: cleanId,
        },
      };
    }

    // Check member status: inactive members should be refused
    const status = String(rawData.status || 'ACTIVE').toUpperCase();
    if (status === 'INACTIVE' || status === 'REVOKED' || status === 'SUSPENDED') {
      return {
        success: false,
        error: {
          type: 'INACTIVE',
          message: 'This personnel credential has been deactivated or revoked.',
          identifier: cleanId,
        },
      };
    }

    // 3. SLUG VERIFICATION: verify the returned member slug matches expectedSlug
    if (expectedSlug && expectedSlug.trim() !== '') {
      const canonicalSlug = String(rawData.slug || '').toLowerCase().trim();
      const cleanExpected = expectedSlug.toLowerCase().trim();

      if (canonicalSlug && canonicalSlug !== cleanExpected) {
        const uniqueId = rawData.uniqueId || cleanId;
        return {
          success: false,
          error: {
            type: 'SLUG_MISMATCH',
            message: `Credential slug mismatch: "${expectedSlug}" does not correspond to permanent identifier "${uniqueId}".`,
            identifier: cleanId,
            correctSlug: rawData.slug,
            canonicalUrl: `/memberID/${rawData.slug}/${uniqueId}`,
          },
        };
      }
    }

    // Successfully normalize dynamic member
    const member = normalizeMemberJson(rawData);
    return {
      success: true,
      data: member,
    };
  } catch (netErr) {
    console.warn('[E-ID API] Backend unreachable, checking offline cache:', netErr);
    // Offline fallback for authentic local cache
    const cached = teamMembers.find(
      (m) =>
        m.id.toLowerCase() === cleanId.toLowerCase() ||
        m.slug.toLowerCase() === cleanId.toLowerCase()
    );

    if (cached) {
      if (expectedSlug && expectedSlug.trim() !== '') {
        if (cached.slug.toLowerCase() !== expectedSlug.toLowerCase().trim()) {
          return {
            success: false,
            error: {
              type: 'SLUG_MISMATCH',
              message: `Credential slug mismatch: "${expectedSlug}" does not correspond to permanent identifier "${cleanId}".`,
              identifier: cleanId,
              correctSlug: cached.slug,
              canonicalUrl: `/memberID/${cached.slug}/${cached.id}`,
            },
          };
        }
      }
      return {
        success: true,
        data: cached,
      };
    }

    return {
      success: false,
      error: {
        type: 'NETWORK_ERROR',
        message: 'NEXUS authentication service is currently unreachable.',
        identifier: cleanId,
      },
    };
  }
}

/**
 * Fetches the full directory of active E-ID cards for pagination and navigation.
 */
export async function fetchAllMembers(): Promise<TeamMember[]> {
  try {
    const url = `${API_BASE}/api/eid/members`;
    let res: Response;
    try {
      res = await fetch(url, { headers: { Accept: 'application/json' } });
    } catch {
      if (API_BASE === '') {
        res = await fetch('http://localhost:3001/api/eid/members', {
          headers: { Accept: 'application/json' },
        });
      } else {
        throw new Error('Unreachable');
      }
    }

    if (res.ok) {
      const body = await res.json();
      if (Array.isArray(body?.data)) {
        return body.data.map(normalizeMemberJson);
      }
    }
  } catch (err) {
    console.warn('[E-ID API] Failed to fetch live member list, falling back to local dataset:', err);
  }

  // Fallback to authentic bundled dataset
  return teamMembers;
}
