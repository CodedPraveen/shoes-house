export function rejectCrossSiteRequest(request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  }
  return null;
}

export async function readCheckoutPayload(request) {
  try {
    const payload = await request.json();
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload
      : null;
  } catch {
    return null;
  }
}

export function checkoutRouteError(error) {
  const unauthorized = error?.message === "Unauthorized";
  if (!unauthorized) {
    console.error("[checkout-api] request failed", { message: error?.message });
  }
  return Response.json(
    {
      ok: false,
      error: unauthorized ? "Authentication required" : "Checkout failed",
    },
    { status: unauthorized ? 401 : 500 },
  );
}
