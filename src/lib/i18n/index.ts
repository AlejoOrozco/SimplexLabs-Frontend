type Locale = 'en' | 'es';

const dictionary = {
  en: {
    sessionExpiredTitle: 'Your session expired',
    signInAgain: 'Sign in again',
    retry: 'Retry',
    notAllowed: 'Not allowed',
    unexpectedError: 'Unexpected error',
  },
  es: {
    sessionExpiredTitle: 'Tu sesion expiro',
    signInAgain: 'Iniciar sesion de nuevo',
    retry: 'Reintentar',
    notAllowed: 'No permitido',
    unexpectedError: 'Error inesperado',
  },
} as const;

export function t(key: keyof typeof dictionary.en, locale: Locale = 'en'): string {
  return dictionary[locale][key];
}
