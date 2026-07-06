export type SignupFormData = {
  // Agency Information
  agencyName: string;
  agencyEmail: string;
  businessPhone: string;
  agencyWebsite: string;
  // Owner Information
  firstName: string;
  lastName: string;
  workEmail: string;
  mobileNumber: string;
  jobTitle: string;
  // Account Security
  password: string;
  confirmPassword: string;
  // Agreements
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  marketingOptIn: boolean;
};

export type SignupFormErrors = Partial<Record<keyof SignupFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const URL_REGEX =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-.~:/?#[\]@!$&'()*+,;=%]*)?$/i;

function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;

  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(trimmed);
}

// ----- Password strength -----

export type PasswordRequirement = {
  label: string;
  met: boolean;
};

export type PasswordStrength = {
  score: number; // 0‒5
  label: string;
  requirements: PasswordRequirement[];
};

export function getPasswordStrength(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    { label: "Minimum 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    {
      label: "One special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = requirements.filter((r) => r.met).length;

  const labels: Record<number, string> = {
    0: "Very weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
    5: "Excellent",
  };

  return { score, label: labels[score] ?? "Very weak", requirements };
}

function isStrongPassword(password: string): boolean {
  return getPasswordStrength(password).score === 5;
}

// ----- Form validation -----

export function validateSignupForm(data: SignupFormData): SignupFormErrors {
  const errors: SignupFormErrors = {};

  // ── Agency Information ──
  if (!data.agencyName.trim()) {
    errors.agencyName = "Agency name is required.";
  }

  const agencyEmail = data.agencyEmail.trim();
  if (!agencyEmail) {
    errors.agencyEmail = "Agency email is required.";
  } else if (!EMAIL_REGEX.test(agencyEmail)) {
    errors.agencyEmail = "Please enter a valid email address.";
  }

  if (data.businessPhone.trim() && !isValidPhone(data.businessPhone)) {
    errors.businessPhone = "Please enter a valid phone number.";
  }

  if (data.agencyWebsite.trim() && !URL_REGEX.test(data.agencyWebsite.trim())) {
    errors.agencyWebsite = "Please enter a valid URL.";
  }

  // ── Owner Information ──
  if (!data.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!data.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  const workEmail = data.workEmail.trim();
  if (!workEmail) {
    errors.workEmail = "Work email is required.";
  } else if (!EMAIL_REGEX.test(workEmail)) {
    errors.workEmail = "Please enter a valid email address.";
  }

  if (!data.mobileNumber.trim()) {
    errors.mobileNumber = "Mobile number is required.";
  } else if (!isValidPhone(data.mobileNumber)) {
    errors.mobileNumber = "Please enter a valid phone number.";
  }

  // jobTitle is optional — no validation

  // ── Account Security ──
  if (!data.password) {
    errors.password = "Password is required.";
  } else if (!isStrongPassword(data.password)) {
    errors.password = "Password must meet all requirements.";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // ── Agreements ──
  if (!data.agreeToTerms) {
    errors.agreeToTerms = "You must accept the Terms of Service.";
  }

  if (!data.agreeToPrivacy) {
    errors.agreeToPrivacy = "You must accept the Privacy Policy.";
  }

  return errors;
}
