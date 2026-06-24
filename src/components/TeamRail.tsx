// Faixa continua de selecoes — "ambiente Mundial". Puro CSS (sem JS):
// um unico contentor .rail com a lista duplicada, deslocado -50% => loop perfeito.
// Pausa ao passar o rato. Desliga em prefers-reduced-motion (ver globals.css).

const TEAMS = [
  "Portugal",
  "Brasil",
  "Argentina",
  "França",
  "Espanha",
  "Inglaterra",
  "Alemanha",
  "Países Baixos",
  "Croácia",
  "Bélgica",
  "Uruguai",
  "México",
  "Canadá",
  "Estados Unidos",
  "Marrocos",
  "Japão",
  "Senegal",
  "Coreia do Sul",
];

export default function TeamRail() {
  const items = [...TEAMS, ...TEAMS];
  return (
    <div className="rail-mask overflow-hidden py-1" aria-hidden="true">
      <div className="rail">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-1.5 text-muted">
            <span className="text-brand">/</span>
            <span className="text-sm font-semibold tracking-wide">{t}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
