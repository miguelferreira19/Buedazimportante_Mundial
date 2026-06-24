/* eslint-disable @next/next/no-img-element */
// Bandeira/escudo da selecao. Usamos <img> simples (os escudos vêm de dominios
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
    return (
      <span
        aria-hidden
        style={{ width: size, height: size, fontSize: size * 0.58 }}
        className="crest-ring"
      >
        🏳️
      </span>
    );
  }
  return (
    <span className="crest-ring" style={{ width: size, height: size }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ width: "78%", height: "78%", objectFit: "contain" }}
      />
    </span>
  );
}
