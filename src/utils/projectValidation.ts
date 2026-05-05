import type { Contributor, ProjectAttachment, AttachmentKind } from '../types/project';

export const ABSTRACT_MIN_LEN = 80;
export const ABSTRACT_MAX_LEN = 2500;
export const KEYWORD_MAX = 24;

export function validateAbstract(text: string): { ok: true } | { ok: false; message: string } {
  const trimmed = text.trim();
  if (trimmed.length < ABSTRACT_MIN_LEN) {
    return {
      ok: false,
      message: `Abstract or summary must be at least ${ABSTRACT_MIN_LEN} characters (currently ${trimmed.length}).`,
    };
  }
  if (trimmed.length > ABSTRACT_MAX_LEN) {
    return {
      ok: false,
      message: `Abstract or summary must be at most ${ABSTRACT_MAX_LEN} characters.`,
    };
  }
  return { ok: true };
}

export function parseKeywordList(raw: string): string[] {
  const parts = raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
    if (out.length >= KEYWORD_MAX) break;
  }
  return out;
}

export function parseTechStack(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isProbablyUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeAttachment(kind: AttachmentKind, url: string, label?: string): ProjectAttachment | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (!isProbablyUrl(trimmed)) return null;
  if (kind === 'github' && !/github\.com/i.test(trimmed)) return null;
  if (kind === 'pdf' && !/\.pdf($|\?)/i.test(trimmed) && !/pdf/i.test(trimmed)) {
    return null;
  }
  return { kind, url: trimmed, label: label?.trim() || undefined };
}

export function parseContributors(namesLine: string, emailsLine: string): Contributor[] {
  const names = namesLine
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const emails = emailsLine
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: Contributor[] = [];
  names.forEach((name, i) => {
    out.push({ name, email: emails[i] });
  });
  return out;
}
