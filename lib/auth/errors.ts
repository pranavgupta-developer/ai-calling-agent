type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_verified"
  | "too_many_attempts"
  | "network_error"
  | "server_error"
  | "session_expired"
  | "unknown";

export type MappedAuthError = {
  code: AuthErrorCode;
  message: string;
};

export function mapAuthError(error: {
  message?: string;
  status?: number;
  code?: string;
}): MappedAuthError {
  const message = error.message?.toLowerCase() ?? "";
  const code = error.code?.toLowerCase() ?? "";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password") ||
    code === "invalid_credentials"
  ) {
    return {
      code: "invalid_credentials",
      message: "Invalid email or password.",
    };
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("email not verified") ||
    code === "email_not_confirmed"
  ) {
    return {
      code: "email_not_verified",
      message: "Your email address has not been verified.",
    };
  }

  if (
    message.includes("too many requests") ||
    message.includes("rate limit") ||
    error.status === 429
  ) {
    return {
      code: "too_many_attempts",
      message: "Too many login attempts. Please try again later.",
    };
  }

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  ) {
    return {
      code: "network_error",
      message: "Network connection lost. Please check your connection.",
    };
  }

  if (message.includes("session") && message.includes("expired")) {
    return {
      code: "session_expired",
      message: "Your session has expired. Please sign in again.",
    };
  }

  if (error.status && error.status >= 500) {
    return {
      code: "server_error",
      message: "Server unavailable. Please try again shortly.",
    };
  }

  return {
    code: "unknown",
    message: "Something went wrong. Please try again.",
  };
}
