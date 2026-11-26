import type { Snippet } from "@/lib/search/highlight";

/** Renders a search snippet with its matches in <mark>. */
export function SnippetText({ snippet }: { snippet: Snippet }) {
  const parts = [];
  let pos = 0;
  for (const [s, e] of snippet.marks) {
    if (s > pos) parts.push(snippet.text.slice(pos, s));
    parts.push(
      <mark key={s} className="search-mark">
        {snippet.text.slice(s, e)}
      </mark>,
    );
    pos = e;
  }
  if (pos < snippet.text.length) parts.push(snippet.text.slice(pos));
  return (
    <>
      {snippet.before && "… "}
      {parts}
      {snippet.after && " …"}
    </>
  );
}
