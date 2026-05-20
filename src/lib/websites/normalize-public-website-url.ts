/**
 * Public URL for opening a website (adds https:// when the user omitted the scheme).
 */
export function normalizePublicWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}
