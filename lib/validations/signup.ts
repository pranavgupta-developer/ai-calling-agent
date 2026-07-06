export type SignupFormData = {
  agencyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export type SignupFormErrors = Partial<Record<keyof SignupFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;

  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(trimmed);
}

export function validateSignupForm(data: SignupFormData): SignupFormErrors {
  const errors: SignupFormErrors = {};

  if (!data.agencyName.trim()) {
    errors.agencyName = "Agency Name is required.";
  }

  if (!data.firstName.trim()) {
    errors.firstName = "First Name is required.";
  }

  if (!data.lastName.trim()) {
    errors.lastName = "Last Name is required.";
  }

  if (!data.email.trim() || !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Email must be valid.";
  }

  if (!isValidPhone(data.phone)) {
    errors.phone = "Phone number must be valid.";
  }

  if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Confirm Password must match Password.";
  }

  if (!data.agreeToTerms) {
    errors.agreeToTerms = "Terms & Conditions must be accepted.";
  }

  return errors;
}
