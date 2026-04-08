"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Converts a lat/lng pair to a human-readable address using Mapbox Geocoding API.
 * Cancels the in-flight request via AbortController whenever lat/lng changes or
 * the component unmounts — no stale updates, no memory leaks.
 */
export function useReverseGeocode(lat: number | null, lng: number | null) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (lat === null || lng === null) {
      setAddress(null);
      setLoading(false);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) return;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setAddress(null);

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng.toFixed(6)},${lat.toFixed(6)}.json` +
        `?access_token=${token}&language=vi&limit=1`,
      { signal: abortRef.current.signal }
    )
      .then((r) => r.json())
      .then((d) => {
        setAddress(d.features?.[0]?.place_name ?? null);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setAddress(null);
          setLoading(false);
        }
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [lat, lng]);

  return { address, loading };
}
