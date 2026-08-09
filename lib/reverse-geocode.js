import "server-only";

const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

function getComponent(components, type, name = "long_name") {
  return components.find((component) => component.types?.includes(type))?.[name] || "";
}

function joinUnique(parts, separator = ", ") {
  return [...new Set(parts.map((part) => part?.trim()).filter(Boolean))].join(separator);
}

function selectBestResult(results) {
  const preferredTypes = [
    "street_address",
    "premise",
    "subpremise",
    "route",
  ];

  return (
    results.find((result) =>
      preferredTypes.some((type) => result.types?.includes(type)),
    ) || results[0]
  );
}

function toCheckoutAddress(result) {
  const components = result.address_components || [];
  const streetNumber = getComponent(components, "street_number");
  const route = getComponent(components, "route");
  const premise = getComponent(components, "premise");
  const subpremise = getComponent(components, "subpremise");
  const neighborhood = getComponent(components, "neighborhood");
  const sublocalityLevel1 = getComponent(components, "sublocality_level_1");
  const sublocality = getComponent(components, "sublocality");
  const locality = getComponent(components, "locality");
  const postalTown = getComponent(components, "postal_town");
  const adminAreaLevel3 = getComponent(components, "administrative_area_level_3");
  const adminAreaLevel2 = getComponent(components, "administrative_area_level_2");
  const state = getComponent(components, "administrative_area_level_1");
  const country = getComponent(components, "country");
  const pincode = getComponent(components, "postal_code");

  const landmark = joinUnique([subpremise, premise, streetNumber]);
  const formattedMain = result.formatted_address?.split(",")?.[0]?.trim() || "";
  const line1 =
    route ||
    neighborhood ||
    sublocalityLevel1 ||
    sublocality ||
    locality ||
    postalTown ||
    formattedMain;

  const line2 = joinUnique(
    [sublocalityLevel1, sublocality, neighborhood].filter(
      (part) => part && part !== line1,
    ),
  );

  const city =
    locality ||
    postalTown ||
    adminAreaLevel3 ||
    sublocalityLevel1 ||
    neighborhood ||
    adminAreaLevel2;

  return {
    line1: line1 || line2 || city,
    landmark: landmark || "",
    line2,
    city,
    state,
    country: country || "India",
    pincode,
  };
}

export async function reverseGeocode(lat, lng) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error("Invalid coordinates");
  }

  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Address lookup is not configured. Please enter the address manually.",
    );
  }

  const url = new URL(GOOGLE_GEOCODING_URL);
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("language", "en");
  url.searchParams.set("region", "in");
  url.searchParams.set("key", apiKey);

  let response;

  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    console.error("[geocoding] Google Geocoding network request failed");
    throw new Error(
      "Address lookup is temporarily unavailable. Please try again or enter the address manually.",
    );
  }

  if (!response.ok) {
    console.error("[geocoding] Google Geocoding HTTP error:", response.status);
    throw new Error(
      "Address lookup is temporarily unavailable. Please enter the address manually.",
    );
  }

  const data = await response.json();

  if (data.status === "ZERO_RESULTS" || !data.results?.length) {
    throw new Error(
      "No address was found for this point. Please move the pin or enter the address manually.",
    );
  }

  if (data.status !== "OK") {
    console.error("[geocoding] Google Geocoding status:", data.status);
    throw new Error(
      "Google could not look up this address. Please try again or enter it manually.",
    );
  }

  const result = selectBestResult(data.results);
  const address = toCheckoutAddress(result);

  if (process.env.NODE_ENV === "development") {
    console.info("[geocoding] Google Geocoding succeeded");
  }

  return address;
}
