import type { Channel, Niche } from '@/lib/types';
import type { AdminCreateUserResult } from '@/lib/types/admin-provisioning';

export const PaymentMethod = {
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  OTHER: 'OTHER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface OnboardingWizardState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  company: {
    mode: 'existing' | 'new';
    existingCompanyId?: string;
    name?: string;
    niche?: Niche;
    phone?: string;
    address?: string;
    notificationPhone?: string;
    notificationEmail?: string;
  };
  credentials: {
    email: string;
    firstName: string;
    lastName: string;
    generatedPassword: string;
  };
  plan: {
    planId: string;
    initialPayment: number;
    startedAt: string;
    nextBillingAt?: string;
  };
  agent: {
    agentName: string;
    fallbackMessage: string;
    escalationMessage: string;
    channels: Channel[];
    paymentMethods: PaymentMethod[];
  };
  whatsapp: {
    phoneNumberId?: string;
    phoneNumber?: string;
    skip: boolean;
  };
}

export type OnboardingResult = AdminCreateUserResult;
