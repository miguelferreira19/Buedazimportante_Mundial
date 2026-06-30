/* eslint-disable @next/next/no-img-element */
// Bandeira/escudo da seleção. Usamos <img> simples (os escudos vêm de domínios
// externos da football-data.org) para evitar configurar o next/image.

export default function Crest({
  src,
  alt,
  size = 22,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
}) {
  if (!src) {
    // Seleção por definir (ex.: fase a eliminar): marca neutra de "mundo".
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className="crest-ring text-faint"
      >
        <svg
          width={size * 0.56}
          height={size * 0.56}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.8 2.4 2.8 15.6 0 18M12 3c-2.8 2.4-2.8 15.6 0 18" />
        </svg>
      </span>
    );
  }
  return (
    <span className="crest-ring" style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ width: "76%", height: "76%", objectFit: "contain" }}
      />
    </span>
  );
}
