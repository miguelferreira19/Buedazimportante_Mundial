// Separador "×" entre golos/equipas, com largura fixa para não partir o
// alinhamento vertical em resultados/inputs (mesma largura em qualquer sítio).
export default function TimesX({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center w-4 shrink-0 ${className}`}
    >
      ×
    </span>
  );
}
