// Formatting utilities for safe value display

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) {
    return "N/A";
  }
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  return `${sign}$${absValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || isNaN(value)) {
    return "N/A";
  }
  
  return `${value.toFixed(0)}%`;
}

export function formatNumber(value: number | null | undefined, fallback: string = "N/A"): string {
  if (value == null || isNaN(value)) {
    return fallback;
  }
  
  return value.toLocaleString("en-US");
}
