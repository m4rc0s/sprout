/** Broto desenhado em um único traço; decorativo (aria-hidden), só anima sem reduced-motion. */
export function SproutGlyph() {
  return (
    <svg className="line-draw" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path pathLength="1" d="M12 22V11" />
      <path pathLength="1" d="M12 11C12 7 9 5 5 5c0 4 3 6 7 6Z" />
      <path pathLength="1" d="M12 14c0-3.5 2.5-6 7-6 0 4-3 6-7 6Z" />
    </svg>
  );
}
