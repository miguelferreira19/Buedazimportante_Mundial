// Emblema recriado (livre) inspirado no Mundial 2026: troféu + "26" com o
// gradiente festivo multicolor. Não é o logótipo oficial da FIFA.

let gradSeq = 0;

export default function Emblem({
  size = 56,
  layout = "stacked",
}: {
  size?: number;
  layout?: "stacked" | "inline";
}) {
  // id único por instância (evita conflitos de gradientes no mesmo DOM)
  const gid = `wcgrad-${gradSeq++}`;
  const trophy = layout === "inline" ? size * 0.82 : size * 0.66;

  return (
    <span className={`emblem ${layout === "inline" ? "inline" : ""}`}>
      <svg
        width={trophy}
        height={trophy}
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gid}
            x1="0"
            y1="0"
            x2="24"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#ff2e7e" />
            <stop offset="0.35" stopColor="#9b30e0" />
            <stop offset="0.7" stopColor="#2f6bff" />
            <stop offset="1" stopColor="#16d6c8" />
          </linearGradient>
        </defs>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
      <span
        className="emblem-26"
        style={{ fontSize: size, lineHeight: 0.78 }}
      >
        26
      </span>
    </span>
  );
}
