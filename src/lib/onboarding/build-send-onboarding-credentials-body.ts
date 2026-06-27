export interface SendOnboardingCredentialsBody {
  userId: string;
  email: string;
  password: string;
  firstName: string;
  companyName: string;
}

const MIN_PASSWORD_LENGTH = 12;

export function buildSendOnboardingCredentialsBody(
  input: SendOnboardingCredentialsBody,
): SendOnboardingCredentialsBody {
  const userId = input.userId.trim();
  const email = input.email.trim();
  const password = input.password;
  const firstName = input.firstName.trim();
  const companyName = input.companyName.trim();

  if (!userId) {
    throw new Error('User id is required to send credentials email');
  }
  if (!email) {
    throw new Error('Email is required to send credentials');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error('Password must be at least 12 characters to email credentials');
  }
  if (!firstName) {
    throw new Error('First name is required for the credentials email');
  }
  if (!companyName) {
    throw new Error('Company name is required for the credentials email');
  }

  return { userId, email, password, firstName, companyName };
}
