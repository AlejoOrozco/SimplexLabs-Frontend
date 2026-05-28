/** When true, admin forms may send `dialogApiKey` / `dialogBaseUrl` to the API (requires backend support). */
export const WHATSAPP_CREDENTIALS_SAVE_ENABLED =
  process.env.NEXT_PUBLIC_WHATSAPP_CREDENTIALS_SAVE_ENABLED === 'true';
