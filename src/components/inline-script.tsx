/**
 * Runs a small script during HTML parsing (before first paint) on full page loads.
 * On client navigations React renders it as inert text/plain, so the matching
 * Client Component must apply the same change itself. Pattern from the Next.js
 * "preventing flash before hydration" guide.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
