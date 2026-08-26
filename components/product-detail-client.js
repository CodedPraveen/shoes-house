"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import {
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ProductRecommendations from "@/components/product-recommendations";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format-price";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-routes";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

function WishlistOutlineIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 612 612"
      fill="none"
      aria-hidden="true"
      className="block h-8 w-8"
    >
      <path
        d="M 33 72 L 33 73 L 29 77 L 29 78 L 26 81 L 26 82 L 20 90 L 12 106 L 12 108 L 10 111 L 10 113 L 9 114 L 9 116 L 8 117 L 8 119 L 6 123 L 6 126 L 5 127 L 5 130 L 4 131 L 4 134 L 3 135 L 3 139 L 2 140 L 2 145 L 1 146 L 1 153 L 0 154 L 0 179 L 1 180 L 1 189 L 2 190 L 2 195 L 3 196 L 3 201 L 4 202 L 5 211 L 6 212 L 7 219 L 9 223 L 9 226 L 10 227 L 10 229 L 11 230 L 11 232 L 12 233 L 13 238 L 15 241 L 16 246 L 18 249 L 18 251 L 21 256 L 21 258 L 33 282 L 35 284 L 36 287 L 38 289 L 40 294 L 46 302 L 47 305 L 50 308 L 50 309 L 52 311 L 54 315 L 57 318 L 59 322 L 62 325 L 62 326 L 65 329 L 65 330 L 69 334 L 69 335 L 73 339 L 73 340 L 78 345 L 78 346 L 98 367 L 98 368 L 125 394 L 126 394 L 133 401 L 134 401 L 145 411 L 146 411 L 150 415 L 151 415 L 155 419 L 156 419 L 164 426 L 168 428 L 175 434 L 179 436 L 182 439 L 183 439 L 185 441 L 186 441 L 197 449 L 200 450 L 205 454 L 208 455 L 213 459 L 223 464 L 225 466 L 232 469 L 234 471 L 252 480 L 259 480 L 275 472 L 277 470 L 284 467 L 286 465 L 291 463 L 293 461 L 296 460 L 298 458 L 306 454 L 314 448 L 320 445 L 326 440 L 327 440 L 329 442 L 329 443 L 344 458 L 345 458 L 348 461 L 349 461 L 357 467 L 367 472 L 369 472 L 372 474 L 374 474 L 375 475 L 377 475 L 381 477 L 384 477 L 385 478 L 388 478 L 389 479 L 395 479 L 396 480 L 421 480 L 422 479 L 428 479 L 429 478 L 436 477 L 437 476 L 439 476 L 440 475 L 445 474 L 448 472 L 450 472 L 458 468 L 460 466 L 463 465 L 465 463 L 469 461 L 472 458 L 473 458 L 489 442 L 489 441 L 492 438 L 492 437 L 496 432 L 498 427 L 500 425 L 501 423 L 501 421 L 504 416 L 504 414 L 505 413 L 506 408 L 507 407 L 507 404 L 508 403 L 508 400 L 509 399 L 509 395 L 510 394 L 510 385 L 511 384 L 511 371 L 510 370 L 510 362 L 509 361 L 509 357 L 508 356 L 508 353 L 507 352 L 507 349 L 506 348 L 506 346 L 505 345 L 504 340 L 496 324 L 494 322 L 492 318 L 489 315 L 489 314 L 473 298 L 472 298 L 470 296 L 470 295 L 473 289 L 475 287 L 477 282 L 479 280 L 488 262 L 488 260 L 492 253 L 492 251 L 496 243 L 496 241 L 497 240 L 497 238 L 498 237 L 498 235 L 499 234 L 499 232 L 500 231 L 500 229 L 501 228 L 501 226 L 503 222 L 503 219 L 504 218 L 504 215 L 505 214 L 505 211 L 506 210 L 506 206 L 507 205 L 507 201 L 508 200 L 508 195 L 509 194 L 509 188 L 510 187 L 510 177 L 511 176 L 511 156 L 510 155 L 510 148 L 509 147 L 509 141 L 508 140 L 508 136 L 507 135 L 507 132 L 506 131 L 505 124 L 503 120 L 503 117 L 501 114 L 501 112 L 498 106 L 498 104 L 492 92 L 490 90 L 489 87 L 487 85 L 485 81 L 477 72 L 477 71 L 466 60 L 465 60 L 461 56 L 457 54 L 454 51 L 451 50 L 449 48 L 435 41 L 433 41 L 430 39 L 428 39 L 427 38 L 425 38 L 421 36 L 418 36 L 417 35 L 414 35 L 413 34 L 410 34 L 409 33 L 404 33 L 403 32 L 396 32 L 395 31 L 361 31 L 360 32 L 353 32 L 352 33 L 347 33 L 346 34 L 343 34 L 342 35 L 335 36 L 334 37 L 332 37 L 331 38 L 329 38 L 328 39 L 323 40 L 318 43 L 316 43 L 312 45 L 310 47 L 305 49 L 303 51 L 299 53 L 296 56 L 295 56 L 292 59 L 291 59 L 277 73 L 277 74 L 273 78 L 271 82 L 268 85 L 267 88 L 265 90 L 259 102 L 259 104 L 257 107 L 257 109 L 255 111 L 254 110 L 254 108 L 253 107 L 252 102 L 247 92 L 245 90 L 244 87 L 242 85 L 240 81 L 237 78 L 237 77 L 233 73 L 233 72 L 221 60 L 220 60 L 216 56 L 215 56 L 212 53 L 211 53 L 206 49 L 201 47 L 199 45 L 193 42 L 191 42 L 183 38 L 180 38 L 179 37 L 177 37 L 173 35 L 170 35 L 169 34 L 165 34 L 164 33 L 159 33 L 158 32 L 151 32 L 150 31 L 116 31 L 115 32 L 108 32 L 107 33 L 103 33 L 102 34 L 98 34 L 97 35 L 90 36 L 89 37 L 87 37 L 86 38 L 81 39 L 78 41 L 76 41 L 62 48 L 60 50 L 57 51 L 51 56 L 50 56 L 45 61 L 44 61 Z M 397 297 L 420 297 L 421 298 L 425 298 L 426 299 L 433 300 L 434 301 L 436 301 L 439 303 L 441 303 L 449 307 L 451 309 L 452 309 L 454 311 L 458 313 L 473 328 L 473 329 L 478 335 L 485 349 L 485 351 L 487 355 L 487 358 L 488 359 L 488 363 L 489 364 L 489 370 L 490 371 L 490 385 L 489 386 L 489 392 L 488 393 L 488 397 L 487 398 L 487 401 L 486 402 L 485 407 L 478 421 L 473 427 L 473 428 L 458 443 L 457 443 L 449 449 L 441 453 L 439 453 L 436 455 L 434 455 L 433 456 L 430 456 L 429 457 L 426 457 L 425 458 L 421 458 L 420 459 L 397 459 L 396 458 L 392 458 L 391 457 L 384 456 L 378 453 L 376 453 L 370 450 L 368 448 L 365 447 L 363 445 L 362 445 L 359 442 L 358 442 L 344 428 L 344 427 L 341 424 L 340 421 L 338 419 L 333 409 L 333 407 L 331 404 L 331 401 L 329 397 L 329 393 L 328 392 L 328 385 L 327 384 L 327 372 L 328 371 L 328 364 L 329 363 L 329 359 L 330 358 L 330 356 L 331 355 L 331 352 L 333 349 L 333 347 L 338 337 L 340 335 L 341 332 L 344 329 L 344 328 L 358 314 L 359 314 L 365 309 L 381 301 L 383 301 L 384 300 L 387 300 L 388 299 L 391 299 L 392 298 L 396 298 Z M 405 337 L 403 338 L 399 342 L 399 344 L 398 345 L 398 366 L 397 367 L 378 367 L 377 368 L 374 368 L 372 369 L 369 372 L 368 374 L 368 376 L 367 377 L 367 379 L 368 380 L 368 382 L 369 384 L 372 387 L 374 388 L 377 388 L 378 389 L 397 389 L 398 390 L 398 411 L 399 412 L 399 414 L 403 418 L 405 419 L 412 419 L 414 418 L 418 414 L 418 412 L 419 411 L 419 390 L 420 389 L 439 389 L 440 388 L 443 388 L 445 387 L 448 384 L 449 382 L 449 380 L 450 379 L 450 377 L 449 376 L 449 374 L 448 372 L 445 369 L 443 368 L 440 368 L 439 367 L 420 367 L 419 366 L 419 345 L 418 344 L 418 342 L 414 338 L 412 337 Z M 427 60 L 439 66 L 441 68 L 442 68 L 444 70 L 448 72 L 464 88 L 464 89 L 467 92 L 467 93 L 471 98 L 474 105 L 477 109 L 477 111 L 482 121 L 482 123 L 484 127 L 484 130 L 485 131 L 485 134 L 486 135 L 486 138 L 487 139 L 487 143 L 488 144 L 488 149 L 489 150 L 489 157 L 490 158 L 490 174 L 489 175 L 489 185 L 488 186 L 488 192 L 487 193 L 487 198 L 486 199 L 486 202 L 485 203 L 485 207 L 484 208 L 483 215 L 482 216 L 482 218 L 481 219 L 481 221 L 480 222 L 480 224 L 479 225 L 479 227 L 478 228 L 478 230 L 477 231 L 476 236 L 471 246 L 471 248 L 458 274 L 456 276 L 454 281 L 451 285 L 450 284 L 448 284 L 445 282 L 443 282 L 442 281 L 440 281 L 436 279 L 433 279 L 432 278 L 428 278 L 427 277 L 422 277 L 421 276 L 396 276 L 395 277 L 389 277 L 388 278 L 381 279 L 380 280 L 378 280 L 377 281 L 372 282 L 369 284 L 367 284 L 359 288 L 357 290 L 354 291 L 352 293 L 348 295 L 345 298 L 344 298 L 329 313 L 329 314 L 326 317 L 326 318 L 321 324 L 313 340 L 313 342 L 312 343 L 312 345 L 311 346 L 311 348 L 309 352 L 309 356 L 308 357 L 308 361 L 307 362 L 307 369 L 306 370 L 306 386 L 307 387 L 307 394 L 308 395 L 309 404 L 310 405 L 310 407 L 311 408 L 311 410 L 312 411 L 313 416 L 316 421 L 313 424 L 312 424 L 301 432 L 298 433 L 293 437 L 290 438 L 288 440 L 285 441 L 283 443 L 278 445 L 276 447 L 271 449 L 269 451 L 255 458 L 253 456 L 244 452 L 242 450 L 235 447 L 233 445 L 230 444 L 228 442 L 223 440 L 221 438 L 215 435 L 204 427 L 201 426 L 198 423 L 197 423 L 195 421 L 194 421 L 192 419 L 188 417 L 185 414 L 184 414 L 181 411 L 180 411 L 177 408 L 176 408 L 173 405 L 172 405 L 169 402 L 168 402 L 164 398 L 163 398 L 159 394 L 158 394 L 153 389 L 152 389 L 146 383 L 145 383 L 137 375 L 136 375 L 102 341 L 102 340 L 95 333 L 95 332 L 90 327 L 90 326 L 85 321 L 85 320 L 82 317 L 82 316 L 78 312 L 76 308 L 73 305 L 71 301 L 68 298 L 68 297 L 62 289 L 61 286 L 59 284 L 55 276 L 53 274 L 49 265 L 47 263 L 44 257 L 44 255 L 39 246 L 39 244 L 36 239 L 35 234 L 33 231 L 33 229 L 32 228 L 32 226 L 31 225 L 31 223 L 29 219 L 28 212 L 26 208 L 26 204 L 25 203 L 24 194 L 23 193 L 23 187 L 22 186 L 22 178 L 21 177 L 21 156 L 22 155 L 22 148 L 23 147 L 23 143 L 24 142 L 24 138 L 25 137 L 26 130 L 27 129 L 27 127 L 28 126 L 28 124 L 29 123 L 30 118 L 32 115 L 32 113 L 37 103 L 39 101 L 40 98 L 42 96 L 44 92 L 47 89 L 47 88 L 63 72 L 64 72 L 72 66 L 84 60 L 86 60 L 92 57 L 95 57 L 96 56 L 103 55 L 104 54 L 108 54 L 109 53 L 116 53 L 117 52 L 149 52 L 150 53 L 157 53 L 158 54 L 162 54 L 163 55 L 167 55 L 168 56 L 171 56 L 172 57 L 174 57 L 175 58 L 180 59 L 185 62 L 187 62 L 191 64 L 193 66 L 196 67 L 198 69 L 199 69 L 208 77 L 209 77 L 214 82 L 214 83 L 222 92 L 222 93 L 226 98 L 228 103 L 230 105 L 232 109 L 232 111 L 235 116 L 235 118 L 237 121 L 237 123 L 239 127 L 239 130 L 240 131 L 240 133 L 241 134 L 241 138 L 242 139 L 242 143 L 243 144 L 243 149 L 244 150 L 244 157 L 245 158 L 245 167 L 246 169 L 250 173 L 252 173 L 253 174 L 258 174 L 262 172 L 264 170 L 266 166 L 266 156 L 267 155 L 267 148 L 268 147 L 268 143 L 269 142 L 269 138 L 270 137 L 271 130 L 272 129 L 272 127 L 273 126 L 273 124 L 274 123 L 275 118 L 277 115 L 277 113 L 282 103 L 284 101 L 285 98 L 287 96 L 287 95 L 289 93 L 291 89 L 297 83 L 297 82 L 302 77 L 303 77 L 312 69 L 315 68 L 317 66 L 320 65 L 322 63 L 324 63 L 331 59 L 333 59 L 334 58 L 336 58 L 340 56 L 343 56 L 344 55 L 348 55 L 349 54 L 353 54 L 354 53 L 361 53 L 362 52 L 394 52 L 395 53 L 402 53 L 403 54 L 412 55 L 413 56 L 415 56 L 416 57 L 419 57 L 425 60 Z"
        fill="#000000"
        stroke="#000000"
        strokeWidth="2"
        strokeLinejoin="round"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WishlistFilledIcon() {
  return (
    // fill heart
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 612 612"
      fill="none"
      aria-hidden="true"
      className="block h-8 w-8"
    >
      <path
        d="M 91 84 L 76 92 L 57 109 L 47 123 L 39 139 L 32 166 L 32 193 L 36 213 L 42 229 L 56 253 L 76 278 L 133 337 L 195 390 L 254 433 L 262 430 L 307 397 L 377 338 L 421 294 L 440 272 L 461 244 L 473 219 L 479 193 L 479 166 L 470 134 L 458 114 L 444 99 L 432 90 L 415 82 L 398 78 L 383 77 L 360 80 L 339 87 L 311 104 L 299 114 L 265 149 L 256 152 L 246 149 L 205 108 L 192 98 L 172 87 L 151 80 L 127 77 L 107 79 Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { isSignedIn } = useAuthSafe();

  const images = (product.images || []).map(
    optimizeCloudinaryImage,
  );

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pendingActions, setPendingActions] = useState(
    new Set(),
  );
  const [actionError, setActionError] = useState("");
  const [optimisticWishlist, setOptimisticWishlist] = useState(
    isInWishlist(product.id),
  );
  const pendingRef = useRef(new Set());
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const currentImage =
    images[activeImage] || images[0] || "";

  const goToImage = (index) => {
    if (!images.length) return;

    const nextIndex =
      (index + images.length) % images.length;

    setActiveImage(nextIndex);
  };

  const previousImage = () => {
    goToImage(activeImage - 1);
  };

  const nextImage = () => {
    goToImage(activeImage + 1);
  };

  /*
   * Mobile swipe gesture.
   *
   * We only react when horizontal movement is stronger
   * than vertical movement, so normal page scrolling
   * remains untouched.
   */
  const handleTouchStart = (event) => {
    const touch = event.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch = event.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    /*
     * Ignore mostly vertical gestures.
     */
    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    /*
     * Ignore tiny movements.
     */
    if (Math.abs(deltaX) < 45) {
      return;
    }

    if (deltaX < 0) {
      nextImage();
    } else {
      previousImage();
    }
  };

  const runAction = async (name, action) => {
    if (pendingRef.current.has(name)) {
      return false;
    }

    pendingRef.current.add(name);

    setPendingActions(
      new Set(pendingRef.current),
    );

    setActionError("");

    try {
      await action();
      return true;
    } catch (error) {
      setActionError(
        error?.message ||
        "Could not complete this action. Please try again.",
      );

      return false;
    } finally {
      pendingRef.current.delete(name);

      setPendingActions(
        new Set(pendingRef.current),
      );
    }
  };

  const requireAuth = (action) => {
    if (hasClerk && !isSignedIn) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(
          getProductPath(product),
        )}`,
      );

      return false;
    }

    action();

    return true;
  };

  const handleAddToCart = () => {
    if (!size) {
      setActionError(
        "Please select a size before continuing.",
      );
      return;
    }

    requireAuth(() =>
      runAction("cart", () =>
        addItem({
          product,
          size,
          quantity,
        }),
      ).then((success) => {
        if (!success) return;

        setAdded(true);

        setTimeout(() => {
          setAdded(false);
        }, 2000);
      }),
    );
  };

  const handleWishlist = () => {
    requireAuth(async () => {
      if (pendingRef.current.has("wishlist")) return;

      const previousState = optimisticWishlist;

      // ⚡ Change heart immediately
      setOptimisticWishlist(!previousState);

      try {
        pendingRef.current.add("wishlist");
        setPendingActions(new Set(pendingRef.current));
        setActionError("");

        await toggleWishlist(product.id);
      } catch (error) {
        // Backend failed → restore heart
        setOptimisticWishlist(previousState);

        setActionError(
          error?.message ||
          "Could not complete this action.",
        );
      } finally {
        pendingRef.current.delete("wishlist");
        setPendingActions(new Set(pendingRef.current));
      }
    });
  };

  const handleBuyNow = () => {
    if (!size) {
      setActionError(
        "Please select a size before continuing.",
      );
      return;
    }

    requireAuth(() => {
      const q = new URLSearchParams({
        productId: product.id,
        size: String(size),
        quantity: String(quantity),
      });

      router.push(
        `/checkout/buy-now?${q.toString()}`,
      );
    });
  };

  const wishlistActive = optimisticWishlist;

  return (
    <>
      <main className="mx-auto mt-15 w-full max-w-[1400px] px-0 pb-32 pt-0 sm:px-6 sm:py-10 lg:px-8 lg:py-14">

        {/* =========================
            PRODUCT TOP AREA
        ========================== */}
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16">
          {/* =========================
              PRODUCT GALLERY
              DESKTOP:
              MAIN IMAGE + VERTICAL THUMBS

              MOBILE:
              MAIN IMAGE + SWIPE
          ========================== */}
          <div className="min-w-0">
            <div className="lg:flex lg:items-start lg:gap-4">
              {/* Main image */}
              <div
                className="relative w-full touch-pan-y overflow-hidden bg-[#f7f7f5] lg:order-1 lg:flex-1"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Mobile floating controls */}
                <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:hidden">
                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white transition active:scale-95"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {/* Wishlist - same style/logic as desktop */}
                  <button
                    type="button"
                    onClick={handleWishlist}
                    // loading={pendingActions.has("wishlist")}
                    className={`flex h-11 w-11 items-center justify-center border border-black/15 p-3 transition active:scale-95 ${wishlistActive
                      ? "bg-black text-white"
                      : "bg-white"
                      }`}
                    aria-label={
                      wishlistActive
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {wishlistActive ? (
                      <WishlistFilledIcon />
                    ) : (
                      <WishlistOutlineIcon />
                    )}
                  </button>
                </div>

                {/* Main image */}
                <div className="aspect-[2/3] w-full sm:aspect-[4/5] lg:aspect-[2/3]">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="h-full w-full select-none object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                      No image
                    </div>
                  )}
                </div>

                {/* Image arrows */}
                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={previousImage}
                      className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition active:scale-95 sm:flex lg:hidden"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition active:scale-95 sm:flex lg:hidden"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                ) : null}
              </div>

              {/* =========================
                  DESKTOP THUMBNAILS
              ========================== */}
              {images.length > 1 ? (
                <div className="hidden w-[76px] shrink-0 flex-col gap-3 lg:order-2 lg:flex">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveImage(index)
                      }
                      className={`relative aspect-square w-full overflow-hidden border bg-[#f7f7f5] transition ${activeImage === index
                        ? "border-black"
                        : "border-transparent hover:border-black/30"
                        }`}
                      aria-label={`View image ${index + 1
                        }`}
                      aria-current={
                        activeImage === index
                      }
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1
                          }`}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* =========================
                MOBILE THUMBNAILS
            ========================== */}
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
                {images.map((image, index) => (
                  <button
                    key={`${image}-mobile-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveImage(index)
                    }
                    className={`h-16 w-16 shrink-0 overflow-hidden border bg-[#f7f7f5] ${activeImage === index
                      ? "border-black"
                      : "border-black/10"
                      }`}
                    aria-label={`View image ${index + 1
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1
                        }`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Mobile swipe hint */}
            {images.length > 1 ? (
              <div className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/35 lg:hidden">
                Swipe to view images
              </div>
            ) : null}
          </div>

          {/* =========================
              PRODUCT INFO
          ========================== */}
          <div className="min-w-0 space-y-7 px-4 sm:px-6 lg:px-0 lg:pt-1">
            {/* Brand / Name / Price */}
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/45 sm:text-xs sm:tracking-[0.25em]">
                {product.brand}
              </p>

              <h2 className="max-w-2xl text-2xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-2xl font-semibold sm:text-3xl">
                  {formatPrice(product.price)}
                </p>

                {product.compareAtPrice ? (
                  <p className="text-base text-black/40 line-through sm:text-lg">
                    {formatPrice(
                      product.compareAtPrice,
                    )}
                  </p>
                ) : null}

                {product.discount ? (
                  <span className="bg-black px-2.5 py-1 text-[11px] text-white sm:text-xs">
                    -{product.discount}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Description */}
            <p className="max-w-xl text-sm leading-6 text-black/60 sm:text-base sm:leading-7">
              {product.description}
            </p>

            {/* =========================
                SIZE
            ========================== */}
            <div className="space-y-4 border-t border-black/10 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
                  Size
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    className={`min-h-11 min-w-11 border px-3.5 text-sm transition ${size === item
                      ? "border-black bg-black text-white"
                      : "border-black/15 hover:border-black/40"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {!size && actionError ? (
                <p
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {actionError}
                </p>
              ) : null}
            </div>

            {/* =========================
                QUANTITY
            ========================== */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
                Quantity
              </p>

              <div className="inline-flex items-center border border-black/15">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1),
                    )
                  }
                  className="p-3.5 transition hover:bg-black/5 active:bg-black/10"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-11 text-center text-sm font-medium">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => q + 1)
                  }
                  className="p-3.5 transition hover:bg-black/5 active:bg-black/10"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* =========================
                ACTIONS
            ========================== */}
            <div className="hidden flex-wrap gap-3 sm:flex">
              <button
                type="button"
                onClick={handleAddToCart}
                // loading={pendingActions.has("cart")}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-black px-7 text-sm font-medium text-white transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag size={16} />

                {added
                  ? "Added to Cart"
                  : "Add To Cart"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="min-h-12 border border-black/15 px-7 text-sm font-medium transition hover:bg-black hover:text-white active:scale-[0.98]"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                disabled={pendingActions.has("wishlist")}
                className={`flex min-h-12 min-w-12 items-center justify-center border border-black/15 p-3 transition hover:bg-black/5 active:scale-95 ${wishlistActive
                  ? "text-red-500"
                  : "text-black"
                  }`}
                aria-label={
                  wishlistActive
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {wishlistActive ? (
                  <WishlistFilledIcon />
                ) : (
                  <WishlistOutlineIcon />
                )}
              </button>
            </div>
                
            {actionError && size ? (
              <p
                className="text-sm text-red-600"
                role="alert"
              >
                {actionError}
              </p>
            ) : null}

            {/* =========================
                DESKTOP PRODUCT DETAILS
                ONLY DESKTOP
            ========================== */}
            <div className="hidden border-t border-black/10 pt-7 lg:block">
              <h3 className="mb-3 text-base font-medium">
                Product Details
              </h3>

              <p className="max-w-xl text-sm leading-7 text-black/60">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            PRODUCT DETAILS
            TABLET + MOBILE

            Desktop uses the version above
            directly below the action buttons.
        ========================== */}
        <div className="mt-12 border-t border-black/10 pt-10 sm:mt-16 sm:pt-12 lg:hidden">
          <div>
            <div className="mb-5 border-b border-black/10 pb-3">
              <h3 className="text-base font-medium">
                Product Details
              </h3>
            </div>

            <p className="text-sm leading-7 text-black/60">
              {product.description}
            </p>
          </div>
        </div>

        {/* =========================
            RECOMMENDATIONS
        ========================== */}
        <div className="mt-14 sm:mt-16">
          <ProductRecommendations
            slug={product.slug}
            productId={product.id}
            brand={product.brand}
            category={product.category}
            price={product.price}
          />
        </div>
      </main>

      {/* =========================
          MOBILE FIXED PURCHASE BAR
      ========================== */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-4 pt-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-[600px] items-center gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleAddToCart}
            // loading={pendingActions.has("cart")}
            className="flex h-14 w-14 shrink-0 items-center justify-center border border-black/10 bg-black/5 transition active:scale-95"
            aria-label={
              added
                ? "Added to cart"
                : "Add to cart"
            }
          >
            <ShoppingBag size={22} />
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex h-14 flex-1 items-center justify-center bg-[#ffe51f] text-base font-semibold text-black transition active:scale-[0.98]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}