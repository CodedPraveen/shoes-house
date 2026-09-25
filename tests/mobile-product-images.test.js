import assert from "node:assert/strict";
import { test } from "node:test";
import {
  absolutePublicImageUrl,
  isMobileHomepageRequest,
  withAbsoluteProductImages,
} from "../lib/mobile-product-images.js";

const imagePath = "/images/products/shoe-1/i_0123456789abcdef0123456789abcdef.webp";
const appUrl = "https://postmart.example/store";

test("mobile product images use the configured public origin without mutating website data", () => {
  const websiteProduct = {
    id: "shoe-1",
    image: imagePath,
    hoverImage: imagePath,
    images: [imagePath, "https://res.cloudinary.com/demo/image/upload/old.webp"],
  };
  const mobileProduct = withAbsoluteProductImages(websiteProduct, appUrl);

  assert.equal(mobileProduct.image, `https://postmart.example${imagePath}`);
  assert.equal(mobileProduct.hoverImage, `https://postmart.example${imagePath}`);
  assert.deepEqual(mobileProduct.images, [
    `https://postmart.example${imagePath}`,
    "https://res.cloudinary.com/demo/image/upload/old.webp",
  ]);
  assert.equal(websiteProduct.image, imagePath);
  assert.equal(websiteProduct.images[0], imagePath);
  assert.notEqual(mobileProduct.images, websiteProduct.images);
});

test("empty optional images stay empty and protocol-relative sources are rejected", () => {
  assert.equal(absolutePublicImageUrl("", appUrl), "");
  assert.equal(absolutePublicImageUrl(null, appUrl), null);
  assert.throws(() => absolutePublicImageUrl("//other.example/image.webp", appUrl));
});

test("homepage section keeps website JSON separate from mobile JSON", () => {
  assert.equal(isMobileHomepageRequest(new Request(appUrl, { headers: { accept: "*/*" } })), false);
  assert.equal(isMobileHomepageRequest(new Request(appUrl, { headers: { accept: "application/json" } })), true);
});
