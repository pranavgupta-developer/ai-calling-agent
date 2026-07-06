export type LoginFormData = {
  email: string;
  password: string;
};

export type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateLoginForm(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const email = data.email.trim();
  const password = data.password;

  if (!email) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}
