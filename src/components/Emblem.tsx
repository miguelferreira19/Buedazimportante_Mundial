// Emblema recriado (livre) inspirado no Mundial 2026: badge laranja com riscas
// de bandeiras a irradiar + troféu. Não é o logótipo oficial da FIFA.

export default function Emblem({ size = 56 }: { size?: number }) {
  return (
    <span
      className="emblem-badge"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="stripes" />
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,.35))" }}
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    </span>
  );
}
