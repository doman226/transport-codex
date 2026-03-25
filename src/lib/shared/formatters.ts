export const formatCurrency = (value: number, currency: "PLN" | "EUR"): string =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

export const formatDistanceKm = (value: number): string =>
  `${new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value)} km`;

export const formatMinutesAsHours = (minutes: number): string => {
  const wholeHours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${wholeHours} h ${remainingMinutes} min`;
};
