import type { PaymentMethod } from '@/lib/types/onboarding';
import { PaymentMethod as PaymentMethodEnum } from '@/lib/types/onboarding';

export function paymentMethodLabel(m: PaymentMethod | 'STRIPE' | 'WIRE_TRANSFER'): string {
  switch (m) {
    case 'STRIPE':
    case PaymentMethodEnum.CARD:
      return 'Card';
    case 'WIRE_TRANSFER':
    case PaymentMethodEnum.BANK_TRANSFER:
      return 'Bank transfer';
    case PaymentMethodEnum.CASH:
      return 'Cash';
    case PaymentMethodEnum.OTHER:
      return 'Other';
    default:
      return String(m);
  }
}
