export const PRODUCT_IMAGE_VALIDATION_CODES = Object.freeze({
  VALID: "valid",
  MISSING: "missing",
  INVALID_TYPE: "invalid_type",
  MALFORMED_URL: "malformed_url",
  INSECURE_PROTOCOL: "insecure_protocol",
  UNSUPPORTED_HOST: "unsupported_host",
  INVALID_CREDENTIALS: "invalid_credentials",
  INVALID_IMAGE_SET: "invalid_image_set",
});

const CLOUDINARY_HOSTNAME = "res.cloudinary.com";
const LOCAL_PRODUCT_IMAGE_PATTERN = /^\/images\/products\/[A-Za-z0-9_-]{1,100}\/i_[a-f0-9]{32}\.webp$/;
const STAGING_IMAGE_PATTERN = /^\/api\/admin\/images\/staging\/i_[a-f0-9]{32}$/;

export function isStagingProductImage(value) {
  return typeof value === "string" && STAGING_IMAGE_PATTERN.test(value.trim());
}

function valid(url, extra = {}) {
  return {
    isValid: true,
    code: PRODUCT_IMAGE_VALIDATION_CODES.VALID,
    reason: null,
    url,
    ...extra,
  };
}

function invalid(code, reason, value = null) {
  return { isValid: false, code, reason, url: null, value };
}

export function validateImageSource(value, { allowLocal = false, allowStaging = false } = {}) {
  if (value == null) {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.MISSING,
      "Product image is missing.",
    );
  }

  if (typeof value !== "string") {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.INVALID_TYPE,
      "Product image URL must be a string.",
    );
  }

  const source = value.trim();
  if (!source) {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.MISSING,
      "Product image is missing.",
    );
  }

  if (allowStaging && isStagingProductImage(source)) {
    return valid(source, { hostname: null, isLocal: true, isStaging: true });
  }

  if (allowLocal && source.startsWith("/") && !source.startsWith("//")) {
    return valid(source, { hostname: null, isLocal: true });
  }

  let parsed;
  try {
    parsed = new URL(source);
  } catch {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.MALFORMED_URL,
      "Product image URL is malformed.",
      source,
    );
  }

  if (parsed.protocol !== "https:") {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.INSECURE_PROTOCOL,
      "Product image URL must use HTTPS.",
      source,
    );
  }

  if (parsed.username || parsed.password) {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.INVALID_CREDENTIALS,
      "Product image URL must not contain credentials.",
      source,
    );
  }

  if (parsed.hostname.toLowerCase() !== CLOUDINARY_HOSTNAME) {
    return invalid(
      PRODUCT_IMAGE_VALIDATION_CODES.UNSUPPORTED_HOST,
      `Unsupported historical product image host: ${parsed.hostname || "unknown"}.`,
      source,
    );
  }

  return valid(parsed.toString(), {
    hostname: CLOUDINARY_HOSTNAME,
    isLocal: false,
  });
}

export function validateProductImageUrl(value) {
  if (typeof value === "string" && LOCAL_PRODUCT_IMAGE_PATTERN.test(value.trim())) {
    return valid(value.trim(), { hostname: null, isLocal: true });
  }
  return validateImageSource(value, { allowStaging: true });
}

export function validateProductImages(images) {
  const list = Array.isArray(images)
    ? images
    : images == null
      ? []
      : [images];
  if (!list.length) {
    return {
      ...invalid(
        PRODUCT_IMAGE_VALIDATION_CODES.MISSING,
        "Product has no images.",
      ),
      invalidImages: [],
      validUrls: [],
    };
  }

  const validations = list.map((image, index) => {
    const source = typeof image === "string" ? image : image?.url;
    return { index, ...validateProductImageUrl(source) };
  });
  const invalidImages = validations.filter((image) => !image.isValid);
  const validUrls = validations
    .filter((image) => image.isValid)
    .map((image) => image.url);

  if (invalidImages.length) {
    const first = invalidImages[0];
    return {
      isValid: false,
      code: PRODUCT_IMAGE_VALIDATION_CODES.INVALID_IMAGE_SET,
      reason: `Image ${first.index + 1}: ${first.reason}`,
      url: null,
      invalidImages,
      validUrls,
    };
  }

  return {
    isValid: true,
    code: PRODUCT_IMAGE_VALIDATION_CODES.VALID,
    reason: null,
    url: validUrls[0],
    invalidImages: [],
    validUrls,
  };
}

export function getProductImageValidation(product) {
  if (product?.imageValidation?.code) return product.imageValidation;

  if (Array.isArray(product?.images) && product.images.length) {
    return validateProductImages(product.images);
  }

  return validateProductImages([product?.image]);
}

export function hasValidProductImages(product) {
  return getProductImageValidation(product).isValid;
}
