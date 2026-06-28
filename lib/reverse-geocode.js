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
      "User-Agent": "AERE-Ecommerce/1.0 (checkout)",
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error("Could not resolve location");
  }

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  const addr = data.address ?? {};

  // const line1 = [addr.house_number, addr.road, addr.neighbourhood]
  //   .filter(Boolean)
  //   .join(" ")
  //   .trim();

  const line1 =
    [
      addr.house_number,
      addr.road,
      addr.neighbourhood,
      addr.suburb,
      addr.hamlet,
    ]
      .filter(Boolean)
      .join(", ") ||
    data.display_name.split(",").slice(0, 2).join(", ");

  // return {
  //   line1: line1 || addr.suburb || addr.village || "",
  //   line2: addr.suburb && line1 ? addr.suburb : "",
  //   city:
  //     addr.city ||
  //     addr.town ||
  //     addr.village ||
  //     addr.county ||
  //     addr.state_district ||
  //     "",
  //   state: addr.state || "",
  //   country: addr.country || "India",
  //   pincode: addr.postcode || "",
  // };
  return {
    line1,
    line2: "",
    city:
      addr.city ||
      addr.town ||
      addr.village ||
      "",
    state: addr.state || "",
    country: addr.country || "India",
    pincode: addr.postcode || "",
  };
}
