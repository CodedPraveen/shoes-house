import "server-only";

const GOOGLE_GEOLOCATION_URL =
  "https://www.googleapis.com/geolocation/v1/geolocate";

function finiteNumber(value) {
  return Number.isFinite(value) ? value : undefined;
}

function sanitizeWifiAccessPoints(accessPoints) {
  if (!Array.isArray(accessPoints)) return [];

  return accessPoints
    .filter(
      (point) =>
        point &&
        typeof point.macAddress === "string" &&
        /^(?:[0-9a-f]{2}:){5}[0-9a-f]{2}$/i.test(point.macAddress),
    )
    .map((point) => ({
      macAddress: point.macAddress,
      ...(finiteNumber(point.signalStrength) !== undefined
        ? { signalStrength: point.signalStrength }
        : {}),
      ...(finiteNumber(point.signalToNoiseRatio) !== undefined
        ? { signalToNoiseRatio: point.signalToNoiseRatio }
        : {}),
      ...(finiteNumber(point.channel) !== undefined ? { channel: point.channel } : {}),
      ...(finiteNumber(point.age) !== undefined ? { age: point.age } : {}),
    }));
}

function sanitizeCellTowers(cellTowers) {
  if (!Array.isArray(cellTowers)) return [];

  return cellTowers
    .filter(
      (tower) =>
        tower &&
        Number.isFinite(tower.mobileNetworkCode) &&
        (Number.isFinite(tower.cellId) || Number.isFinite(tower.newRadioCellId)),
    )
    .map((tower) => {
      const allowed = [
        "cellId",
        "newRadioCellId",
        "locationAreaCode",
        "mobileCountryCode",
        "mobileNetworkCode",
        "age",
        "signalStrength",
        "timingAdvance",
      ];

      return Object.fromEntries(
        allowed
          .filter((key) => Number.isFinite(tower[key]))
          .map((key) => [key, tower[key]]),
      );
    });
}

/**
 * Server-only integration for callers that already possess real Wi-Fi or cell
 * measurements. Browsers do not expose these values, so checkout intentionally
 * does not call this service with invented data or an empty IP-only request.
 */
export async function locateFromNetworkSignals({
  wifiAccessPoints,
  cellTowers,
  radioType,
  homeMobileCountryCode,
  homeMobileNetworkCode,
  carrier,
} = {}) {
  const wifi = sanitizeWifiAccessPoints(wifiAccessPoints);
  const cells = sanitizeCellTowers(cellTowers);

  if (wifi.length < 2 && cells.length === 0) {
    return {
      ok: false,
      skipped: true,
      reason: "No usable Wi-Fi access point or cell tower measurements were provided.",
    };
  }

  const apiKey = process.env.GOOGLE_GEOLOCATION_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      skipped: true,
      reason: "Google Geolocation API is not configured.",
    };
  }

  const body = {
    considerIp: false,
    ...(wifi.length >= 2 ? { wifiAccessPoints: wifi } : {}),
    ...(cells.length ? { cellTowers: cells } : {}),
    ...(typeof radioType === "string" ? { radioType } : {}),
    ...(Number.isFinite(homeMobileCountryCode) ? { homeMobileCountryCode } : {}),
    ...(Number.isFinite(homeMobileNetworkCode) ? { homeMobileNetworkCode } : {}),
    ...(typeof carrier === "string" ? { carrier } : {}),
  };

  const url = new URL(GOOGLE_GEOLOCATION_URL);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        ok: false,
        skipped: true,
        reason: "Google could not resolve the supplied network measurements.",
      };
    }

    if (!response.ok) {
      console.error("[geolocation] Google Geolocation HTTP error:", response.status);
      return {
        ok: false,
        skipped: true,
        reason: "Google Geolocation is temporarily unavailable.",
      };
    }

    const data = await response.json();
    const latitude = data.location?.lat;
    const longitude = data.location?.lng;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return {
        ok: false,
        skipped: true,
        reason: "Google Geolocation returned no usable coordinates.",
      };
    }

    return {
      ok: true,
      latitude,
      longitude,
      accuracy: Number.isFinite(data.accuracy) ? data.accuracy : null,
    };
  } catch {
    console.error("[geolocation] Google Geolocation network request failed");
    return {
      ok: false,
      skipped: true,
      reason: "Google Geolocation is temporarily unavailable.",
    };
  }
}
