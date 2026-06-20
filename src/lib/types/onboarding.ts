export const PaymentMethod = {
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  OTHER: 'OTHER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
