"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, MapPin, Star, Globe, Lock, AlertCircle, Info, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import {
  createPlace,
  publishPlaceReview,
  type PlaceResult,
} from "@/services/placeReviewService";
import { API_BASE_URL } from "@/lib/config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResultItem {
  type: string;
  id: string;
  title: string;
  lat?: number | null;
  lng?: number | null;
  rating?: number;
}

type NearbyStatus = "checking" | "blocked" | "auto-attach" | "clear" | null;
type VisibilityMode = "PRIVATE" | "PUBLIC";

interface AddPlaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lat: number;
  lng: number;
  onSuccess: (place: PlaceResult) => void;
  onViewExisting: (place: PlaceResult) => void;
}

// ─── CATEGORY OPTIONS (mirrors getPoiMeta labels) ─────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "cafe", label: "☕ Cafe" },
  { value: "hotel", label: "🏨 Accommodation" },
  { value: "hospital", label: "🏥 Medical" },
  { value: "school", label: "🎓 Education" },
  { value: "park", label: "🌳 Park" },
  { value: "shop", label: "🛍️ Shopping" },
  { value: "bank", label: "🏦 Finance" },
  { value: "worship", label: "🛕 Worship" },
  { value: "gas", label: "⛽ Gas Station" },
  { value: "transit", label: "🚌 Transit" },
  { value: "sport", label: "🏃 Sports" },
  { value: "entertainment", label: "🎭 Entertainment" },
  { value: "other", label: "📍 Other" },
];

// ─── MINI MAP (static image + fallback chain) ─────────────────────────────────

function MiniMapImage({ lat, lng }: { lat: number; lng: number }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [imgError, setImgError] = useState(false);

  const styleEnv = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL ?? "";
  const styleMatch = styleEnv.match(/mapbox:\/\/styles\/(.+)/);
  // If custom style is private it may 403 → onError falls back to streets-v12
  const style = styleMatch ? styleMatch[1] : "mapbox/streets-v12";

  const buildSrc = (s: string) =>
    `https://api.mapbox.com/styles/v1/${s}/static/` +
    `pin-s-marker+00c45a(${lng.toFixed(6)},${lat.toFixed(6)})/` +
    `${lng.toFixed(6)},${lat.toFixed(6)},14/560x180@2x` +
    `?access_token=${token}`;

  if (!token || imgError) {
    return (
      <div className="w-full h-[130px] rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center border border-green-200 dark:border-green-800">
        <span className="flex items-center gap-2 text-sm font-mono text-green-700 dark:text-green-300">
          <MapPin className="w-4 h-4" />
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={buildSrc(style)}
      alt="Selected location"
      className="w-full h-[130px] rounded-xl object-cover"
      onError={() => {
        if (style !== "mapbox/streets-v12") {
          // First failure: try the default style. Trigger by updating imgError
          // We can't change the src mid-render, so we use imgError as a signal
          // to show fallback, but first attempt streets-v12 via a second img.
        }
        setImgError(true);
      }}
    />
  );
}

// Custom 2-tier img: tries custom style first, falls back to streets-v12, then text
function MiniMapImageWithFallback({ lat, lng }: { lat: number; lng: number }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [tryIndex, setTryIndex] = useState(0); // 0=custom, 1=streets-v12, 2=text fallback

  const styleEnv = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL ?? "";
  const styleMatch = styleEnv.match(/mapbox:\/\/styles\/(.+)/);
  const customStyle = styleMatch ? styleMatch[1] : null;

  const styles = customStyle
    ? [customStyle, "mapbox/streets-v12"]
    : ["mapbox/streets-v12"];

  const buildSrc = (s: string) =>
    `https://api.mapbox.com/styles/v1/${s}/static/` +
    `pin-s-marker+00c45a(${lng.toFixed(6)},${lat.toFixed(6)})/` +
    `${lng.toFixed(6)},${lat.toFixed(6)},14/560x180@2x` +
    `?access_token=${token}`;

  if (!token || tryIndex >= styles.length) {
    return (
      <div className="w-full h-[130px] rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center border border-green-200 dark:border-green-800">
        <span className="flex items-center gap-2 text-sm font-mono text-green-700 dark:text-green-300">
          <MapPin className="w-4 h-4" />
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={buildSrc(styles[tryIndex])}
      alt="Selected location"
      className="w-full h-[130px] rounded-xl object-cover"
      onError={() => setTryIndex((i) => i + 1)}
    />
  );
}

// ─── STAR RATING ──────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── WORD COUNT ───────────────────────────────────────────────────────────────

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function AddPlaceModal({
  open,
  onOpenChange,
  lat,
  lng,
  onSuccess,
  onViewExisting,
}: AddPlaceModalProps) {
  // ── Form state ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stars, setStars] = useState(5);
  const [mode, setMode] = useState<VisibilityMode>("PRIVATE");
  const [depositAmount, setDepositAmount] = useState(0);

  // ── UI state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [showNoReviewAlert, setShowNoReviewAlert] = useState(false);

  // ── Nearby duplicate state ──
  const [nearbyStatus, setNearbyStatus] = useState<NearbyStatus>(null);
  const [nearbyPlace, setNearbyPlace] = useState<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    category: string | null;
    address: string | null;
  } | null>(null);

  const submitAbortRef = useRef<AbortController | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // ── Reverse geocode ──
  const { address, loading: geocoding } = useReverseGeocode(
    open ? lat : null,
    open ? lng : null
  );

  // ── Reset all state when modal closes ──
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setCategory("");
      setStars(5);
      setMode("PRIVATE");
      setDepositAmount(0);
      setIsSubmitting(false);
      setInlineError(null);
      setShowNoReviewAlert(false);
      setNearbyStatus(null);
      setNearbyPlace(null);
      submitAbortRef.current?.abort();
    }
  }, [open]);

  // ── Nearby duplicate check (server-driven) ──
  useEffect(() => {
    if (!open || title.trim().length < 2) {
      if (open) setNearbyStatus("clear");
      return;
    }

    const ctrl = new AbortController();
    setNearbyStatus("checking");

    fetch(
      `${API_BASE_URL}/api/search/suggest?q=${encodeURIComponent(title)}&lat=${lat}&lng=${lng}&nearby=true&limit=5`,
      { credentials: "include", signal: ctrl.signal }
    )
      .then((r) => r.json())
      .then((data) => {
        const items: SearchResultItem[] = data?.data?.items ?? [];

        // Haversine-lite: degrees → meters (good enough for < 200 m)
        const distM = (aLat: number, aLng: number) =>
          Math.sqrt((aLat - lat) ** 2 + (aLng - lng) ** 2) * 111_320;

        for (const item of items) {
          if (item.type !== "place" || item.lat == null || item.lng == null)
            continue;
          if (distM(item.lat, item.lng) > 50) continue;

          const placeId = Number(item.id);
          const nearby = {
            id: placeId,
            name: item.title,
            lat: item.lat,
            lng: item.lng,
            category: null,
            address: null,
          };

          if (item.rating != null && item.rating > 0) {
            // Already reviewed → block new creation
            setNearbyStatus("blocked");
            setNearbyPlace(nearby);
            return;
          } else {
            // Exists but no review → auto-attach
            setNearbyStatus("auto-attach");
            setNearbyPlace(nearby);
            return;
          }
        }
        setNearbyStatus("clear");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setNearbyStatus("clear");
      });

    return () => ctrl.abort();
  }, [open, title, lat, lng]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setInlineError(null);
    setShowNoReviewAlert(false);

    if (!title.trim()) {
      setInlineError("Title is required.");
      return;
    }
    if (nearbyStatus === "blocked") return; // button disabled anyway

    const wc = wordCount(description);
    if (mode === "PUBLIC" && wc < 5) {
      setShowNoReviewAlert(true);
      return;
    }

    setIsSubmitting(true);
    submitAbortRef.current?.abort();
    submitAbortRef.current = new AbortController();
    const signal = submitAbortRef.current.signal;

    try {
      let placeId: number;
      let placeResult: PlaceResult;

      if (nearbyStatus === "auto-attach" && nearbyPlace) {
        placeId = nearbyPlace.id;
        placeResult = {
          id: nearbyPlace.id,
          name: nearbyPlace.name,
          latitude: nearbyPlace.lat,
          longitude: nearbyPlace.lng,
          category: nearbyPlace.category,
          address: nearbyPlace.address,
          reviewCount: 0,
        };
        toast.info(`Attaching review to "${nearbyPlace.name}"`);
      } else {
        const { place, duplicate } = await createPlace(
          {
            name: title.trim(),
            description: description.trim() || undefined,
            category: category || undefined,
            address: address || undefined,
            latitude: lat,
            longitude: lng,
          },
          signal
        );
        placeId = place.id;
        placeResult = place;
        if (duplicate) toast.info("Place already exists — attaching your review.");
      }

      const content = description.trim();

      await publishPlaceReview(
        placeId,
        {
          stars,
          content,
          visibility: mode,
          depositAmount: mode === "PUBLIC" ? depositAmount : undefined,
        },
        signal
      );

      toast.success("Place added!");
      onSuccess(placeResult);
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ??
        (err instanceof Error ? err.message : "Something went wrong.");
      setInlineError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title, description, category, stars, mode, depositAmount,
    nearbyStatus, nearbyPlace, address, lat, lng, onSuccess,
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const wc = wordCount(description);
  const showDeposit = mode === "PUBLIC" && wc < 100;
  const submitDisabled =
    isSubmitting || nearbyStatus === "blocked" || nearbyStatus === "checking";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        {/* Mini map */}
        <div className="px-6 pt-6">
          <MiniMapImageWithFallback lat={lat} lng={lng} />
        </div>

        <div className="px-6 pb-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add New Place
            </DialogTitle>
          </DialogHeader>

          {/* ── Public / Private Toggle ─────────────────────────────────── */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("PRIVATE")}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                mode === "PRIVATE"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Private
            </button>
            <button
              type="button"
              onClick={() => setMode("PUBLIC")}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                mode === "PUBLIC"
                  ? "bg-green-600 text-white"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Public
            </button>
          </div>

          {/* ── Nearby duplicate banner ──────────────────────────────────── */}
          {nearbyStatus === "checking" && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking nearby places…
            </div>
          )}

          {nearbyStatus === "blocked" && nearbyPlace && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  &ldquo;{nearbyPlace.name}&rdquo; already exists here with reviews.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onViewExisting({
                      id: nearbyPlace.id,
                      name: nearbyPlace.name,
                      latitude: nearbyPlace.lat,
                      longitude: nearbyPlace.lng,
                      category: nearbyPlace.category,
                      address: nearbyPlace.address,
                      reviewCount: 1,
                    });
                  }}
                  className="mt-1 text-xs text-red-600 dark:text-red-400 underline underline-offset-2 hover:no-underline"
                >
                  View existing place →
                </button>
              </div>
            </div>
          )}

          {nearbyStatus === "auto-attach" && nearbyPlace && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Nearby: &ldquo;{nearbyPlace.name}&rdquo; — your review will be added there.
              </p>
            </div>
          )}

          {/* ── No-review alert ──────────────────────────────────────────── */}
          {showNoReviewAlert && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  Public places need a review (≥ 5 words).
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("PRIVATE");
                      setShowNoReviewAlert(false);
                      void handleSubmit();
                    }}
                    className="text-xs px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                  >
                    Switch to Private
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoReviewAlert(false);
                      descriptionRef.current?.focus();
                    }}
                    className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-md transition-colors"
                  >
                    Add Review ↑
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Title ──────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Phở Hà Nội"
              maxLength={255}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* ── Description ────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description{mode === "PUBLIC" && <span className="text-gray-400 font-normal text-xs ml-1">(public review)</span>}
            </label>
            <textarea
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={5}
              maxLength={5000}
              placeholder={
                mode === "PUBLIC"
                  ? "Write your review… (≥100 words for free public post)"
                  : "Add a note (optional)"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{wc} words</span>
              <span>{description.length} / 5000</span>
            </div>
          </div>

          {/* ── Location (reverse geocode) ──────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[38px]">
              {geocoding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-400">Detecting address…</span>
                </>
              ) : address ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {address}
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-sm font-mono text-gray-500">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── Category ────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Rating (PUBLIC only) ────────────────────────────────────── */}
          {mode === "PUBLIC" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rating
              </label>
              <StarRating
                value={stars}
                onChange={setStars}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* ── Deposit (PUBLIC + < 100 words) ──────────────────────────── */}
          {showDeposit && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Deposit (KNOW-U tokens)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Add a deposit to publish a public review with &lt;100 words.
              </p>
            </div>
          )}

          {/* ── Inline error ────────────────────────────────────────────── */}
          {inlineError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{inlineError}</p>
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitDisabled}
              className="flex-1 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add Place →"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddPlaceModal;
