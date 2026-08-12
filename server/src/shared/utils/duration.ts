export type SessionStatus = 'active' | 'revoked';

export function parseDuration(value: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match) throw new Error(`Invalid duration: ${value}`);
  const n = parseInt(match[1], 10);
  const unit = match[2] as 's' | 'm' | 'h' | 'd';
  const seconds = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 0;
  return n * seconds;
}