import { OTP_RESEND_SECONDS } from "./authClient";

const KEY = "jamimode-otp-sent-at";

export { OTP_RESEND_SECONDS };

export function setOtpSentAt(phone: string, at: number = Date.now()) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ phone, at }));
  } catch {
    /* storage unavailable */
  }
}

export function getOtpRemainingSeconds(phone: string): number {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { phone: string; at: number };
    if (parsed.phone !== phone) return 0;
    const elapsed = Math.floor((Date.now() - parsed.at) / 1000);
    return Math.max(0, OTP_RESEND_SECONDS - elapsed);
  } catch {
    return 0;
  }
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
