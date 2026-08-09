const FIELD_LIMITS = {
  label: 40,
  fullName: 100,
  phone: 10,
  line1: 200,
  landmark: 200,
  line2: 200,
  city: 100,
  state: 100,
  country: 100,
  pincode: 6,
};

function normalize(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function validateAddressInput(input = {}) {
  const address = {
    label: normalize(input.label, FIELD_LIMITS.label) || "Home",
    fullName: normalize(input.fullName, FIELD_LIMITS.fullName),
    phone: normalize(input.phone, FIELD_LIMITS.phone).replace(/\D/g, ""),
    line1: normalize(input.line1, FIELD_LIMITS.line1),
    landmark: normalize(input.landmark, FIELD_LIMITS.landmark) || null,
    line2: normalize(input.line2, FIELD_LIMITS.line2) || null,
    city: normalize(input.city, FIELD_LIMITS.city),
    state: normalize(input.state, FIELD_LIMITS.state),
    country: normalize(input.country, FIELD_LIMITS.country) || "India",
    pincode: normalize(input.pincode, FIELD_LIMITS.pincode).replace(/\D/g, ""),
  };

  const errors = {};

  if (!address.fullName) errors.fullName = "Enter the recipient's name.";
  if (!/^\d{10}$/.test(address.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  if (!address.line1) {
    errors.line1 = "Enter Address 1, such as the road or main location.";
  }
  if (!address.city) errors.city = "Enter the city, town, or village.";
  if (!address.state) errors.state = "Enter the state.";
  if (!/^[1-9]\d{5}$/.test(address.pincode)) {
    errors.pincode = "Enter a valid 6-digit Indian PIN code.";
  }
  if (!address.country) errors.country = "Enter the country.";

  return {
    address,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function firstAddressError(errors) {
  return Object.values(errors)[0] || "Please check the shipping address.";
}

export function mergeGeocodedAddress(current, geocoded, touchedFields = new Set()) {
  const next = { ...current };
  const fields = ["line1", "landmark", "line2", "city", "state", "country", "pincode"];

  for (const field of fields) {
    const value = geocoded?.[field];
    if (value && (!touchedFields.has(field) || !current[field])) {
      next[field] = value;
    }
  }

  return next;
}
