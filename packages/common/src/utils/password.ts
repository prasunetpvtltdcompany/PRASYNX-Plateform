import crypto from 'crypto';

export function generatePassword(length: number = 8): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length * 2);
}
