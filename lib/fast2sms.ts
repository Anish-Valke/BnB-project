/**
 * Fast2SMS API Helper & In-Memory OTP Store
 */

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

// In-memory OTP storage for validation (5 min expiration)
const otpStore = new Map<string, OtpEntry>();

export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends OTP via Fast2SMS API (or falls back to dev mode ONLY if FAST2SMS_DEMO_MODE=true)
 */
export async function sendFast2SMSOtp(phoneNumber: string): Promise<{
  success: boolean;
  message: string;
  isDemo: boolean;
  otpForTesting?: string;
}> {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return {
      success: false,
      message: "Please enter a valid 10-digit mobile number.",
      isDemo: false,
    };
  }

  const otp = generate6DigitOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(cleanPhone, { otp, expiresAt });

  const apiKey = process.env.FAST2SMS_API_KEY;
  const isDemoMode = process.env.FAST2SMS_DEMO_MODE === "true";

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_fast2sms_api_key") {
    if (isDemoMode) {
      console.log(`[Fast2SMS Demo Mode] OTP for ${cleanPhone}: ${otp}`);
      return {
        success: true,
        message: `OTP sent successfully to ${cleanPhone} (Demo Mode OTP: ${otp})`,
        isDemo: true,
        otpForTesting: otp,
      };
    } else {
      console.warn("[Fast2SMS Error]: FAST2SMS_API_KEY is not configured and FAST2SMS_DEMO_MODE is not active.");
      return {
        success: false,
        message: "Unable to send OTP. SMS service is not configured.",
        isDemo: false,
      };
    }
  }

  try {
    let response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: cleanPhone,
      }),
    });

    let data = await response.json();

    // Fast2SMS status 996 indicates 'otp' route requires website verification.
    // Fall back to Fast2SMS 'q' (Quick SMS) route which sends instantly without verification.
    if (data.status_code === 996 || data.return === false) {
      console.warn("[Fast2SMS OTP route fallback to Quick SMS]:", data.message);
      response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `Your BnB Health verification code is: ${otp}`,
          flash: "0",
          numbers: cleanPhone,
        }),
      });
      data = await response.json();
    }

    if (data.return === true || data.status_code === 200) {
      return {
        success: true,
        message: `OTP sent via Fast2SMS to ${cleanPhone}`,
        isDemo: false,
      };
    } else {
      console.error("[Fast2SMS API Failure]:", data);
      if (isDemoMode) {
        console.log(`[Fast2SMS Demo Fallback] OTP for ${cleanPhone}: ${otp}`);
        return {
          success: true,
          message: `Fast2SMS API failed, but Demo Mode is active. OTP: ${otp}`,
          isDemo: true,
          otpForTesting: otp,
        };
      }
      return {
        success: false,
        message: "Unable to send OTP. Please try again.",
        isDemo: false,
      };
    }
  } catch (err: any) {
    console.error("[Fast2SMS Network Error]:", err.message);
    if (isDemoMode) {
      return {
        success: true,
        message: `Network error, but Demo Mode is active. OTP: ${otp}`,
        isDemo: true,
        otpForTesting: otp,
      };
    }
    return {
      success: false,
      message: "Unable to send OTP. Please try again later.",
      isDemo: false,
    };
  }
}

/**
 * Verifies submitted OTP against stored value
 */
export function verifyFast2SMSOtp(phoneNumber: string, inputOtp: string): {
  valid: boolean;
  message: string;
} {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const entry = otpStore.get(cleanPhone);
  const isDemoMode = process.env.FAST2SMS_DEMO_MODE === "true";

  // Master OTP codes are ONLY permitted when FAST2SMS_DEMO_MODE=true
  if (isDemoMode && (inputOtp === "123456" || inputOtp === "999999")) {
    otpStore.delete(cleanPhone);
    return { valid: true, message: "OTP verified successfully (Demo Master Test Code)." };
  }

  if (!entry) {
    return { valid: false, message: "OTP expired or not requested. Please request a new OTP." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanPhone);
    return { valid: false, message: "OTP expired. Please request a new OTP." };
  }

  if (entry.otp !== inputOtp.trim()) {
    return { valid: false, message: "Invalid OTP code. Please check and try again." };
  }

  otpStore.delete(cleanPhone);
  return { valid: true, message: "OTP verified successfully!" };
}
