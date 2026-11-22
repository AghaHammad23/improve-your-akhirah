/**
 * Renders a translation exactly as published, showing its footnote markers ("[12]") as superscripts.
 * The words are never changed (QuranEnc terms); only the marker styling differs.
 */
export function TranslationText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/);
  return (
    <>
      {parts.map((part, i) =>
        /^\[\d+\]$/.test(part) ? (
          <sup key={i} className="fn-ref">
            {part.slice(1, -1)}
          </sup>
        ) : (
          part
        ),
      )}
    </>
  );
}
