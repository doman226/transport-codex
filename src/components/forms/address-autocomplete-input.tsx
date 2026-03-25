"use client";

import { useEffect, useState } from "react";
import type { AddressSuggestion } from "@/types/geocoding";

interface AddressAutocompleteInputProps {
  label: string;
  value: string;
  countryCode: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className: string;
}

export const AddressAutocompleteInput = ({
  label,
  value,
  countryCode,
  placeholder,
  onChange,
  className
}: AddressAutocompleteInputProps) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const normalizedCountryCode = countryCode?.trim() || "PL";

  useEffect(() => {
    // Clear stale suggestions after country change (e.g. PL -> CZ).
    setSuggestions([]);
    setIsOpen(false);
  }, [normalizedCountryCode]);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          country: normalizedCountryCode,
          limit: "6"
        });

        const response = await fetch(`/api/geocoding/suggest?${params.toString()}`, {
          signal: abortController.signal
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const payload = (await response.json()) as { items?: AddressSuggestion[] };
        setSuggestions(payload.items ?? []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => {
      abortController.abort();
      clearTimeout(timer);
    };
  }, [normalizedCountryCode, value]);

  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <div className="relative">
        <input
          className={className}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => {
            if (suggestions.length) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 120);
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
        />

        {isOpen && (isLoading || suggestions.length > 0) ? (
          <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl">
            {isLoading ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Szukam podpowiedzi...
              </div>
            ) : null}

            {!isLoading &&
              suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.displayName}-${suggestion.lat}-${suggestion.lng}`}
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-800 transition hover:bg-brand-50"
                  onMouseDown={() => {
                    onChange(suggestion.displayName);
                    setIsOpen(false);
                  }}
                >
                  <span className="block font-medium">{suggestion.label}</span>
                  <span className="block text-xs text-slate-500">
                    {suggestion.fallbackUsed ? "Podpowiedź fallback" : "Podpowiedź API"}
                  </span>
                </button>
              ))}
          </div>
        ) : null}
      </div>
    </label>
  );
};
