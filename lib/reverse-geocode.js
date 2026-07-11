/**
 * Reverse geocode via OpenStreetMap Nominatim (no API key).
 * Use sparingly — rate limited server-side.
 */
export async function reverseGeocode(lat, lon) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");

  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Shoes-House-Ecommerce/1.0 (checkout)",
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Could not resolve location");
  }

  const data = await res.json();
  const addr = data.address ?? {};

  const line1Parts = [
    addr.house_number,
    addr.road,
    addr.residential,
    addr.neighbourhood,
    addr.suburb,
    addr.quarter,
    addr.city_block,
    addr.hamlet,
    addr.allotments,
  ].filter(Boolean);

  let line1 = line1Parts.join(", ");

  if (!line1) {
    line1 =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.hamlet ||
      addr.village ||
      addr.quarter ||
      "";
  }

  return {
    line1,

    line2: [
      addr.village,
      addr.city,
    ]
      .filter(Boolean)
      .join(", "),

    city:
      addr.state_district ||
      addr.county ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.county ||
      addr.state_district ||
      "",

    state: addr.state
      ? `${addr.state}, ${addr.country || "India"}`
      : (addr.country || "India"),

    country: addr.country || "India",

    pincode: addr.postcode || "",
  };
}