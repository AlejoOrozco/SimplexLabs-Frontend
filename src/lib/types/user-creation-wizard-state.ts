import type { UserCreationMode } from '@/lib/types/admin-provisioning';

export type UserWizardUserType = UserCreationMode;

export interface UserWizardState {
  userType: UserWizardUserType | null;
  companyId: string | null;
  companyName: string | null;
  credentials: {
    email: string;
    firstName: string;
    lastName: string;
    generatedPassword: string;
  };
  role: 'COMPANY_ADMIN' | 'COMPANY_STAFF';
  permissionOverrides: Array<{ permissionKey: string; isGranted: boolean }>;
  step: number;
}

/** @deprecated Use {@link UserWizardState} */
export type UserCreationWizardState = UserWizardState;

export const USER_WIZARD_STORAGE_KEY = 'simplex:admin:user-wizard:v2';

export function createInitialUserWizardState(): UserWizardState {
  return {
    userType: null,
    companyId: null,
    companyName: null,
    credentials: {
      firstName: '',
      lastName: '',
      email: '',
      generatedPassword: '',
    },
    role: 'COMPANY_STAFF',
    permissionOverrides: [],
    step: 1,
  };
}

/** @deprecated Use {@link createInitialUserWizardState} */
export const createInitialUserCreationState = createInitialUserWizardState;

export function maxStepForUserWizard(userType: UserWizardUserType): number {
  return userType === 'client' ? 4 : 5;
}

/** @deprecated Use {@link maxStepForUserWizard} */
export const maxStepForUserCreationMode = maxStepForUserWizard;

export function parseUserWizardUrl(searchParams: URLSearchParams): UserWizardState {
  const base = createInitialUserWizardState();
  const modeParam = searchParams.get('mode');
  const stepParam = searchParams.get('step');
  const companyIdParam = searchParams.get('companyId');
  const userType: UserWizardUserType | null =
    modeParam === 'client' || modeParam === 'staff' ? modeParam : companyIdParam ? 'client' : null;
  const stepParsed = stepParam ? Number.parseInt(stepParam, 10) : Number.NaN;
  const step = Number.isFinite(stepParsed) && stepParsed >= 1 ? stepParsed : userType ? 2 : 1;
  const companyId = companyIdParam ?? null;
  if (!userType) return base;
  return {
    ...base,
    userType,
    step,
    companyId,
    companyName: null,
  };
}

export function mergeUserWizardDraftWithUrl(draft: UserWizardState, searchParams: URLSearchParams): UserWizardState {
  const url = parseUserWizardUrl(searchParams);
  const urlHasDeepLink = Boolean(searchParams.get('companyId') || searchParams.get('mode'));
  if (urlHasDeepLink) {
    return {
      ...draft,
      userType: url.userType ?? draft.userType,
      companyId: url.companyId ?? draft.companyId,
      companyName: url.companyName ?? draft.companyName,
      step: url.step,
      credentials: {
        ...draft.credentials,
        ...url.credentials,
      },
    };
  }
  return draft;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function reviveUserWizardState(raw: unknown): UserWizardState | null {
  if (!isRecord(raw)) return null;
  const base = createInitialUserWizardState();
  const cred = isRecord(raw.credentials) ? raw.credentials : {};
  const permRaw = Array.isArray(raw.permissionOverrides) ? raw.permissionOverrides : [];
  const permissionOverrides = permRaw
    .filter(isRecord)
    .map((p) => ({
      permissionKey: typeof p.permissionKey === 'string' ? p.permissionKey : '',
      isGranted: Boolean(p.isGranted),
    }))
    .filter((p) => p.permissionKey.length > 0);
  const userType =
    raw.userType === 'client' || raw.userType === 'staff' ? (raw.userType as UserWizardUserType) : null;
  const role = raw.role === 'COMPANY_ADMIN' || raw.role === 'COMPANY_STAFF' ? raw.role : 'COMPANY_STAFF';
  const step = typeof raw.step === 'number' && raw.step >= 1 ? raw.step : base.step;
  return {
    userType,
    companyId: typeof raw.companyId === 'string' ? raw.companyId : null,
    companyName: typeof raw.companyName === 'string' ? raw.companyName : null,
    credentials: {
      firstName: typeof cred.firstName === 'string' ? cred.firstName : '',
      lastName: typeof cred.lastName === 'string' ? cred.lastName : '',
      email: typeof cred.email === 'string' ? cred.email : '',
      generatedPassword: typeof cred.generatedPassword === 'string' ? cred.generatedPassword : '',
    },
    role,
    permissionOverrides,
    step,
  };
}

export function serializeUserWizardState(state: UserWizardState): unknown {
  return { v: 2, ...state };
}
