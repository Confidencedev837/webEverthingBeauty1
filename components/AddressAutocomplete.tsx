import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

interface AddressAutocompleteProps {
  apiKey: string | undefined;
  value: string;
  onChange: (address: string) => void;
  onValidAddress: (address: string, isValid: boolean) => void;
  placeholder?: string;
  className?: string;
}

// Module-level flag to avoid loading the script twice
let scriptLoaded = false;
let scriptLoading = false;
const scriptReadyCallbacks: (() => void)[] = [];

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) {
      resolve();
      return;
    }
    scriptReadyCallbacks.push(resolve);
    if (scriptLoading) return;
    scriptLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      scriptReadyCallbacks.forEach((cb) => cb());
      scriptReadyCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

// ─── Validation helpers ────────────────────────────────────────────────────────

function validatePlaceComponents(place: any): boolean {
  const components: { types: string[] }[] = place.address_components ?? [];
  const types = components.flatMap((c) => c.types);

  const hasStreet = types.some((t) =>
    ["route", "premise", "street_address", "point_of_interest", "establishment"].includes(t)
  );
  const hasArea = types.some((t) =>
    [
      "locality",
      "sublocality",
      "administrative_area_level_2",
      "administrative_area_level_1",
      "neighborhood",
    ].includes(t)
  );
  const formatted: string = place.formatted_address ?? "";
  const wordCount = formatted.trim().split(/\s+/).length;

  return hasStreet && hasArea && wordCount >= 3;
}

function validatePlainText(text: string): boolean {
  const words = text.trim().split(/\s+/);
  if (words.length < 3) return false;
  // Reject purely alphabetic strings with no digits or punctuation — too vague
  const pureAlpha = /^[a-zA-Z\s]+$/.test(text.trim());
  if (pureAlpha) return false;
  return true;
}

const INPUT_CLASS =
  "w-full px-4 py-3.5 rounded-2xl border border-[#E9ECEF] dark:border-white/10 bg-white dark:bg-white/5 text-[#1A1A1A] dark:text-white text-sm font-medium outline-none focus:border-[#6C35A6] focus:ring-4 focus:ring-[#6C35A6]/10 transition-all placeholder-[#9CA3AF]";

const ERROR_MSG =
  "Please provide a complete address including a street name and area so your specialist can locate you.";

// ─── Plain-text fallback ───────────────────────────────────────────────────────

function PlainTextInput({
  value,
  onChange,
  onValidAddress,
  placeholder,
  className,
}: Omit<AddressAutocompleteProps, "apiKey">) {
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    const valid = validatePlainText(value);
    onValidAddress(value, valid);
    setError(valid || value.trim() === "" ? null : ERROR_MSG);
  };

  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder ?? "Enter your address"}
        autoComplete="off"
        className={INPUT_CLASS}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500 leading-snug">{error}</p>
      )}
    </div>
  );
}

// ─── Google-powered autocomplete ───────────────────────────────────────────────

interface Prediction {
  description: string;
  place_id: string;
}

function GoogleAutocomplete({
  apiKey,
  value,
  onChange,
  onValidAddress,
  placeholder,
  className,
}: Required<Pick<AddressAutocompleteProps, "apiKey">> &
  Omit<AddressAutocompleteProps, "apiKey">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  // Load script once
  useEffect(() => {
    loadGoogleMapsScript(apiKey).then(() => setReady(true));
  }, [apiKey]);

  // Init services
  useEffect(() => {
    if (!ready) return;
    const g = (window as any).google;
    autocompleteServiceRef.current = new g.maps.places.AutocompleteService();
    // PlacesService requires a map or a DOM node
    const dummy = document.createElement("div");
    placesServiceRef.current = new g.maps.places.PlacesService(dummy);
  }, [ready]);

  // Build / update map when mapCenter changes
  useEffect(() => {
    if (!showMap || !mapCenter || !mapRef.current || !ready) return;
    const g = (window as any).google;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new g.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
        disableDefaultUI: true,
        gestureHandling: "none",
      });
    } else {
      mapInstanceRef.current.setCenter(mapCenter);
    }

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    markerRef.current = new g.maps.Marker({
      position: mapCenter,
      map: mapInstanceRef.current,
    });
  }, [showMap, mapCenter, ready]);

  // Clear map when input is cleared
  useEffect(() => {
    if (value.trim() === "") {
      setShowMap(false);
      setMapCenter(null);
      setPredictions([]);
      setShowDropdown(false);
      setError(null);
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    }
  }, [value]);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteServiceRef.current || input.trim().length < 2) {
        setPredictions([]);
        setShowDropdown(false);
        return;
      }
      setLoading(true);
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "ng" },
          types: ["geocode", "establishment"],
        },
        (results: any[] | null, status: string) => {
          setLoading(false);
          const g = (window as any).google;
          if (status === g.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(
              results.map((r) => ({
                description: r.description,
                place_id: r.place_id,
              }))
            );
            setShowDropdown(true);
          } else {
            setPredictions([]);
            setShowDropdown(false);
          }
        }
      );
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setError(null);
    setShowMap(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!ready) return;
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelect = (prediction: Prediction) => {
    setShowDropdown(false);
    setPredictions([]);
    onChange(prediction.description);

    if (!placesServiceRef.current) return;
    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["address_components", "formatted_address", "geometry"],
      },
      (place: any, status: string) => {
        const g = (window as any).google;
        if (status !== g.maps.places.PlacesServiceStatus.OK || !place) {
          setError(ERROR_MSG);
          onValidAddress(prediction.description, false);
          return;
        }
        const valid = validatePlaceComponents(place);
        onValidAddress(place.formatted_address ?? prediction.description, valid);

        if (valid) {
          const loc = place.geometry?.location;
          if (loc) {
            setMapCenter({ lat: loc.lat(), lng: loc.lng() });
            setShowMap(true);
          }
          setError(null);
        } else {
          setError(ERROR_MSG);
          setShowMap(false);
        }
      }
    );
  };

  const handleBlur = () => {
    // Delay hiding dropdown so click on suggestion registers
    setTimeout(() => setShowDropdown(false), 150);
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder ?? "Enter your address"}
          autoComplete="off"
          className={INPUT_CLASS}
        />
        {/* Spinner */}
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-[#6C35A6]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Custom dropdown */}
      {showDropdown && predictions.length > 0 && (
        <ul
          className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
          style={{ zIndex: 9999 }}
        >
          {predictions.map((p) => (
            <li
              key={p.place_id}
              onMouseDown={() => handleSelect(p)}
              className="px-4 py-3 hover:bg-[#F3EDF8] dark:hover:bg-[#6C35A6]/10 cursor-pointer text-sm text-[#1A1A1A] dark:text-white transition-colors"
            >
              <span className="flex items-start gap-2">
                {/* Pin icon */}
                <svg
                  className="mt-0.5 shrink-0 w-4 h-4 text-[#6C35A6]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {p.description}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 leading-snug">{error}</p>
      )}

      {/* Map preview */}
      {showMap && (
        <div
          ref={mapRef}
          style={{
            height: "200px",
            borderRadius: "16px",
            overflow: "hidden",
            marginTop: "12px",
          }}
        />
      )}
    </div>
  );
}

// ─── Public component ──────────────────────────────────────────────────────────

export default function AddressAutocomplete(props: AddressAutocompleteProps) {
  const { apiKey, ...rest } = props;

  if (!apiKey) {
    return <PlainTextInput {...rest} />;
  }

  return <GoogleAutocomplete apiKey={apiKey} {...rest} />;
}
