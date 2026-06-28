import { z } from 'zod';

export const recordManualPaymentSchema = z.object({
  paidAt: z.string().datetime({ message: 'Payment date is required' }),
  paymentMethod: z.string().min(1, 'Payment method is required').max(50),
  amount: z.number().nonnegative().optional(),
  billingRecordId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type RecordManualPaymentFormValues = z.infer<typeof recordManualPaymentSchema>;

export const recordManualPaymentUiSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription is required'),
  paidAtLocal: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required').max(50),
  amount: z
    .string()
    .optional()
    .refine((value) => value == null || value === '' || !Number.isNaN(Number(value)), {
      message: 'Amount must be a number',
    })
    .refine((value) => value == null || value === '' || Number(value) >= 0, {
      message: 'Amount cannot be negative',
    }),
  billingRecordId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type RecordManualPaymentUiFormValues = z.infer<typeof recordManualPaymentUiSchema>;

export function recordManualPaymentUiToDto(
  values: RecordManualPaymentUiFormValues,
): { subscriptionId: string; dto: RecordManualPaymentFormValues } {
  const amountRaw = values.amount?.trim();
  const amount =
    amountRaw != null && amountRaw.length > 0 ? Number.parseFloat(amountRaw) : undefined;

  const billingRecordId = values.billingRecordId?.trim();
  const notes = values.notes?.trim();

  return {
    subscriptionId: values.subscriptionId,
    dto: {
      paidAt: new Date(values.paidAtLocal).toISOString(),
      paymentMethod: values.paymentMethod,
      amount,
      billingRecordId: billingRecordId && billingRecordId.length > 0 ? billingRecordId : undefined,
      notes: notes && notes.length > 0 ? notes : undefined,
    },
  };
}

export function defaultRecordPaymentDatetimeLocal(): string {
  const now = new Date();
  const pad = (part: number): string => String(part).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

