let resendPromise;

export async function getResendClient() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  if (!resendPromise) {
    resendPromise = import("resend").then(({ Resend }) => new Resend(process.env.RESEND_API_KEY));
  }
  return resendPromise;
}
