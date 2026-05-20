import type { CompanyWizardState } from '@/lib/types/company-creation-wizard-state';
import type {
  AdminCompanyAgentPaymentMethod,
  AdminCreateCompanyDto,
} from '@/lib/types/admin-provisioning';
import { PlanFeatureType } from '@/lib/types';
import type { PaymentMethod } from '@/lib/types/onboarding';
import { PaymentMethod as PaymentMethodEnum } from '@/lib/types/onboarding';

function trimOrUndefined(value: string): string | undefined {
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

function mapWizardPaymentToApi(method: PaymentMethod): AdminCompanyAgentPaymentMethod | null {
  if (method === PaymentMethodEnum.CARD) return 'STRIPE';
  if (method === PaymentMethodEnum.BANK_TRANSFER) return 'WIRE_TRANSFER';
  return null;
}

export function buildAdminCreateCompanyDto(state: CompanyWizardState): AdminCreateCompanyDto {
  const { info, plans, agentConfig, whatsapp } = state;
  const hasAgentsPlan = plans.some((p) => p.category === PlanFeatureType.AGENTS);

  const dto: AdminCreateCompanyDto = {
    name: info.name.trim(),
    niche: info.niche,
    phone: trimOrUndefined(info.phone),
    address: trimOrUndefined(info.address),
    notificationPhone: trimOrUndefined(info.notificationPhone),
    notificationEmail: trimOrUndefined(info.notificationEmail),
    whatsappPhoneNumberId: trimOrUndefined(whatsapp.phoneNumberId),
    whatsappPhoneNumber: trimOrUndefined(whatsapp.phoneNumber),
    plans: plans.map((p) => ({
      planId: p.planId,
      billingCycle: p.billingCycle,
      initialPayment: p.initialPayment,
      startedAt: p.startedAt,
    })),
  };

  if (hasAgentsPlan && agentConfig) {
    const paymentMethods = agentConfig.paymentMethods
      .map(mapWizardPaymentToApi)
      .filter((m): m is AdminCompanyAgentPaymentMethod => m !== null);
    dto.agentConfig = {
      name: agentConfig.name.trim(),
      fallbackMessage: agentConfig.fallbackMessage.trim(),
      escalationMessage: agentConfig.escalationMessage.trim(),
      channels: [...agentConfig.channels],
      paymentMethods,
    };
  }

  return dto;
}
