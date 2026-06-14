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
        style={{ width: size, height: size, fontSize: size * 0.9 }}
        className="inline-flex items-center justify-center"
      >
        🏳️
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
