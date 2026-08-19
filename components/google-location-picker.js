"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { LocateFixed, X } from "lucide-react";
import { reverseGeocodeAction } from "@/actions/geocode-actions";
import LoadingButton from "@/components/ui/loading-button";
import Image from "next/image";

const DEFAULT_CENTER = { lat: 22.9734, lng: 78.6569 };
const MAX_AUTOMATIC_ACCURACY_METERS = 1000;
const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

let mapsPromise;

function loadGoogleMaps() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return Promise.reject(
      new Error("Google Maps is not configured. Please enter the address manually."),
    );
  }

  if (!mapsPromise) {
    setOptions({
      key: apiKey,
      v: "weekly",
      language: "en",
      region: "IN",
      authReferrerPolicy: "origin",
      mapIds: [mapId],
    });

    mapsPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]);
  }

  return mapsPromise;
}

function coordinatesFromMarker(position) {
  if (!position) return null;

  const lat = typeof position.lat === "function" ? position.lat() : position.lat;
  const lng = typeof position.lng === "function" ? position.lng() : position.lng;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function getGeolocationMessage(error) {
  if (error?.code === 1) {
    return "Location permission was denied. You can select your location on the map or enter the address manually.";
  }

  if (error?.code === 2) {
    return "We couldn't get your exact location. Please move the pin or enter your address manually.";
  }

  if (error?.code === 3) {
    return "Location detection timed out. Please select your delivery location on the map.";
  }

  return "Unable to detect your current location. Please select your delivery location on the map.";
}

export default function GoogleLocationPicker({
  initialCoordinates,
  onLocationConfirmed,
}) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geolocationRequestRef = useRef(0);
  const triggerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(
    initialCoordinates || DEFAULT_CENTER,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const moveMarker = useCallback((coordinates, zoom) => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.position = coordinates;
    mapRef.current.panTo(coordinates);
    if (zoom) mapRef.current.setZoom(zoom);
    setSelectedCoordinates(coordinates);
  }, []);

  const requestCurrentLocation = useCallback(() => {
    setError("");
    setMessage("");

    if (!navigator.geolocation) {
      setMessage(
        "Location detection is not supported in this browser. Please move the pin manually.",
      );
      return;
    }

    const requestId = geolocationRequestRef.current + 1;
    geolocationRequestRef.current = requestId;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== geolocationRequestRef.current) return;

        const { latitude, longitude, accuracy } = position.coords;

        if (process.env.NODE_ENV === "development") {
          console.info("[location-picker] GPS accuracy:", accuracy);
        }

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          const zoom =
            accuracy <= 100 ? 17 : accuracy <= 500 ? 15 : accuracy <= 1000 ? 13 : 11;
          moveMarker({ lat: latitude, lng: longitude }, zoom);
        }

        if (Number.isFinite(accuracy) && accuracy <= MAX_AUTOMATIC_ACCURACY_METERS) {
          setMessage(
            `Your approximate location is shown (accuracy about ${Math.round(accuracy)} m). Move the pin to the exact delivery point.`,
          );
        } else {
          setMessage(
            "Your detected location may be imprecise. It is shown on the map so you can move the pin to the exact delivery point.",
          );
        }

        setLocating(false);
      },
      (geolocationError) => {
        if (requestId !== geolocationRequestRef.current) return;
        setMessage(getGeolocationMessage(geolocationError));
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    );
  }, [moveMarker]);

  function closePicker() {
    geolocationRequestRef.current += 1;
    setIsOpen(false);
    setLocating(false);
    setConfirming(false);
    setMapReady(false);
    setError("");
    triggerRef.current?.focus();
  }

  async function confirmLocation() {
    if (!selectedCoordinates) return;

    setConfirming(true);
    setError("");

    try {
      if (process.env.NODE_ENV === "development") {
        console.info("[location-picker] Selected coordinates:", selectedCoordinates);
      }

      const address = await reverseGeocodeAction(
        selectedCoordinates.lat,
        selectedCoordinates.lng,
      );

      await onLocationConfirmed({
        address,
        coordinates: selectedCoordinates,
      });
      closePicker();
    } catch (geocodingError) {
      console.error("[location-picker] Geocoding failed");
      setError(
        geocodingError?.message ||
          "We could not find an address for this point. Please move the pin or enter the address manually.",
      );
      setConfirming(false);
    }
  }

  useEffect(() => {
    if (!isOpen || !mapElementRef.current) return undefined;

    let disposed = false;
    let mapClickListener;
    let markerDragListener;
    const startingCoordinates = initialCoordinates || DEFAULT_CENTER;

    setSelectedCoordinates(startingCoordinates);
    setMapLoading(true);
    setMapReady(false);
    setError("");
    setMessage("");

    async function initializeMap() {
      try {
        const [{ Map }, { AdvancedMarkerElement }] = await loadGoogleMaps();
        if (disposed || !mapElementRef.current) return;

        const map = new Map(mapElementRef.current, {
          center: startingCoordinates,
          zoom: initialCoordinates ? 17 : 5,
          mapId,
          clickableIcons: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
        });

        const marker = new AdvancedMarkerElement({
          map,
          position: startingCoordinates,
          title: "Delivery location",
          gmpDraggable: true,
        });

        mapRef.current = map;
        markerRef.current = marker;

        mapClickListener = map.addListener("click", (event) => {
          const coordinates = event.latLng?.toJSON();
          if (!coordinates) return;
          marker.position = coordinates;
          map.panTo(coordinates);
          setSelectedCoordinates(coordinates);
          setMessage("Pin moved. Confirm when it matches the delivery location.");
        });

        markerDragListener = marker.addListener("dragend", () => {
          const coordinates = coordinatesFromMarker(marker.position);
          if (coordinates) {
            setSelectedCoordinates(coordinates);
            setMessage("Pin moved. Confirm when it matches the delivery location.");
          }
        });

        setMapLoading(false);
        setMapReady(true);

        if (process.env.NODE_ENV === "development") {
          console.info("[location-picker] Google Maps loaded");
        }

        if (!initialCoordinates) requestCurrentLocation();
      } catch (mapsError) {
        if (disposed) return;
        console.error("[location-picker] Google Maps failed to load");
        setMapLoading(false);
        setMapReady(false);
        setError(
          mapsError?.message ||
            "Google Maps could not load. Please check your connection or enter the address manually.",
        );
      }
    }

    initializeMap();

    return () => {
      disposed = true;
      geolocationRequestRef.current += 1;
      mapClickListener?.remove();
      markerDragListener?.remove();
      if (markerRef.current) markerRef.current.map = null;
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [initialCoordinates, isOpen, requestCurrentLocation]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape" && !confirming) closePicker();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirming, isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setMapReady(false);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium transition hover:border-black/40"
      >
        {/* <MapPin aria-hidden="true" size={15} /> */}
        <Image src="/Mappin.svg" alt="Map Pin" width={20} height={20} />
        Select location on map
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end bg-black/55 sm:items-center sm:justify-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !confirming) closePicker();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-picker-title"
            className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4 sm:px-6">
              <div>
                <h2 id="location-picker-title" className="text-lg font-medium">
                  Select delivery location
                </h2>
                <p className="mt-1 text-xs text-black/55">
                  Tap the map or drag the pin to the exact delivery point.
                </p>
              </div>
              <button
                type="button"
                onClick={closePicker}
                disabled={confirming}
                aria-label="Close location picker"
                className="rounded-full p-2 transition hover:bg-black/5 disabled:opacity-50"
              >
                <X aria-hidden="true" size={20} />
              </button>
            </header>

            <div className="relative h-[52dvh] min-h-80 w-full bg-zinc-100 sm:h-120">
              <div ref={mapElementRef} className="h-full w-full" />
              {mapLoading ? (
                <div className="absolute inset-0 grid place-items-center bg-zinc-100 text-sm text-black/60">
                  Loading Google Maps…
                </div>
              ) : null}
            </div>

            <div className="space-y-3 border-t border-black/10 px-5 py-4 sm:px-6">
              {message ? (
                <p className="text-xs leading-relaxed text-black/60" aria-live="polite">
                  {message}
                </p>
              ) : null}
              {error ? (
                <p className="text-xs leading-relaxed text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <LoadingButton
                  type="button"
                  onClick={requestCurrentLocation}
                  disabled={mapLoading || locating || confirming || !mapReady}
                  loading={locating}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 px-4 py-2.5 text-sm font-medium transition hover:border-black/40 disabled:opacity-50"
                >
                  <LocateFixed aria-hidden="true" size={16} />
                  Use my location
                </LoadingButton>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={closePicker}
                    disabled={confirming}
                    className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="button"
                    onClick={confirmLocation}
                    disabled={mapLoading || confirming || !selectedCoordinates || !mapReady}
                    loading={confirming}
                    className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    Confirm this location
                  </LoadingButton>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
