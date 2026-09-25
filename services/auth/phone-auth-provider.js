/**
 * Provider boundary. Implementations must generate/send and verify OTPs;
 * PostMart never accepts a client assertion that an OTP was valid.
 */
export class PhoneAuthProvider {
  async sendOtp(_phone) {
    throw new Error("Phone provider unavailable");
  }

  async verifyOtp(_providerSessionId, _otp) {
    throw new Error("Phone provider unavailable");
  }
}

export class PhoneProviderUnavailableError extends Error {
  constructor() {
    super("Phone authentication is temporarily unavailable");
    this.code = "PHONE_PROVIDER_UNAVAILABLE";
  }
}

/**
 * Selected provider: 2Factor. Its publicly indexed API versions disagree on
 * the verification contract. Keep this fail-closed until the account-specific
 * API contract is supplied and exercised with sandbox credentials.
 */
export class TwoFactorProvider extends PhoneAuthProvider {
  constructor(apiKey = process.env.TWO_FACTOR_API_KEY) {
    super();
    this.hasKey = Boolean(apiKey);
    this.configured = false;
  }

  async sendOtp(_phone) {
    throw new PhoneProviderUnavailableError();
  }

  async verifyOtp(_providerSessionId, _otp) {
    throw new PhoneProviderUnavailableError();
  }
}

export const phoneAuthProvider = new TwoFactorProvider();
