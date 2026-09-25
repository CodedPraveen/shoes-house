/** Convert mapped product image paths only at mobile response boundaries. */
export function absolutePublicImageUrl(source, appUrl = process.env.NEXT_PUBLIC_APP_URL) {
  if (!source || !source.startsWith("/")) return source;
  if (source.startsWith("//")) throw new Error("Invalid public image URL");

  const base = new URL(appUrl);
  if (!(["https:", "http:"].includes(base.protocol)) || base.username || base.password) {
    throw new Error("Invalid public app URL");
  }
  return new URL(source, base).toString();
}

export function withAbsoluteProductImages(product, appUrl = process.env.NEXT_PUBLIC_APP_URL) {
  return {
    ...product,
    image: absolutePublicImageUrl(product.image, appUrl),
    hoverImage: absolutePublicImageUrl(product.hoverImage, appUrl),
    images: product.images.map((image) => absolutePublicImageUrl(image, appUrl)),
  };
}

export function isMobileHomepageRequest(request) {
  // The native API client explicitly sends JSON; the website's fetch uses */*.
  return request.headers.get("accept")?.trim().toLowerCase() === "application/json";
}
