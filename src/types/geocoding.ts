export interface AddressSuggestion {
  label: string;
  displayName: string;
  lat: number;
  lng: number;
  source: string;
  fallbackUsed: boolean;
}
