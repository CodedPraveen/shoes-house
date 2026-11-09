export class ClerkIdentityConflictError extends Error {
  constructor(message = "Clerk identity conflicts with an existing customer record") {
    super(message);
    this.name = "ClerkIdentityConflictError";
    this.code = "CLERK_IDENTITY_CONFLICT";
  }
}

export function isClerkIdentityConflict(error) {
  return error?.code === "CLERK_IDENTITY_CONFLICT";
}

export function assertEmailIsUnclaimed(emailOwner) {
  if (!emailOwner) return;
  throw new ClerkIdentityConflictError(
    "Email already belongs to another customer record",
  );
}
