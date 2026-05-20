const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*';

const ALPHABET = LOWER + UPPER + DIGITS + SYMBOLS;

function randomInt(maxExclusive: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const n = buf[0];
  if (n === undefined) {
    return 0;
  }
  return n % maxExclusive;
}

/** Client-side preview password for admin onboarding; server should still enforce policy on create. */
export function generateStrongPassword(length = 20): string {
  const pick = (alphabet: string): string => {
    const c = alphabet[randomInt(alphabet.length)];
    return c ?? alphabet[0] ?? '';
  };
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];
  const remainingLength = Math.max(length - required.length, 4);
  const chars: string[] = [...required];
  for (let i = 0; i < remainingLength; i += 1) {
    chars.push(pick(ALPHABET));
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const tmp = chars[i];
    const swap = chars[j];
    if (tmp !== undefined && swap !== undefined) {
      chars[i] = swap;
      chars[j] = tmp;
    }
  }
  return chars.join('');
}
