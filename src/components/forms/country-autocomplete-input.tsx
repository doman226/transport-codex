"use client";

import { useMemo, useState } from "react";
import { getEuropeanCountrySuggestions } from "@/lib/locations/european-countries";

interface CountryAutocompleteInputProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className: string;
}

export const CountryAutocompleteInput = ({
  label,
  value,
  placeholder,
  onChange,
  className
}: CountryAutocompleteInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const trimmedValue = value.trim();
  const suggestions = useMemo(
    () => getEuropeanCountrySuggestions(trimmedValue, 8),
    [trimmedValue]
  );

  const exactMatch = suggestions.some(
    (country) => country.toLowerCase() === trimmedValue.toLowerCase()
  );

  return (
    <label className="text-sm font-semibold text-brand-700">
      {label}
      <div className="relative">
        <input
          className={className}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 120);
          }}
          onChange={(event) => {
            onChange(event.target.value);
            setIsOpen(true);
          }}
        />

        {isOpen && suggestions.length > 0 && !exactMatch ? (
          <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-brand-100 bg-white/95 p-1 shadow-xl">
            {suggestions.map((countryName) => (
              <button
                key={countryName}
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-brand-800 transition hover:bg-accent-50"
                onMouseDown={() => {
                  onChange(countryName);
                  setIsOpen(false);
                }}
              >
                <span className="block font-medium">{countryName}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </label>
  );
};
