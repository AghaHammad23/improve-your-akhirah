/** Fills "{name}" placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Formats a number in the locale's digits (e.g. Arabic-Indic for "ar"). */
export function formatNumber(locale: string, n: number): string {
  return new Intl.NumberFormat(locale).format(n);
}
