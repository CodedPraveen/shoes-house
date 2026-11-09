const PRIVATE_HEADERS = {
  "Cache-Control": "no-store, private",
  "Referrer-Policy": "no-referrer",
};

export function guestOrderResponse(access) {
  if (access.status === "valid") {
    const {
      userId,
      guestAccessTokenHash,
      guestAccessExpiresAt,
      guestAccessRevokedAt,
      ...order
    } = access.order;
    return { status: 200, body: order, headers: PRIVATE_HEADERS };
  }

  return {
    status: access.status === "expired" ? 410 : 404,
    body: { error: "Order link is invalid or expired" },
    headers: PRIVATE_HEADERS,
  };
}

export function guestOrderErrorResponse(error) {
  const rateLimited = error?.code === "RATE_LIMITED";
  return {
    status: rateLimited ? 429 : 500,
    body: { error: rateLimited ? "Too many requests. Please try again later." : "Unable to retrieve order" },
    headers: PRIVATE_HEADERS,
  };
}
