export function getCheckoutIdentity(user, input) {
  const email = user?.email || input.email;
  if (!user && !email) throw new Error("Email address is required for guest checkout");
  return { userId: user?.id ?? null, email };
}
