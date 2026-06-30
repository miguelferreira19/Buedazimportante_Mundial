// Nome da seleção: código curto (TLA, estilo placar) no telemóvel, nome
// completo a partir de sm. Evita truncar nomes longos ("Estados Unidos").

export default function TeamName({
  name,
  code,
  className = "",
}: {
  name: string | null;
  code: string | null;
  className?: string;
}) {
  const full = name ?? "A definir";
  const short = code ?? (name ? name.slice(0, 3).toUpperCase() : "—");
  return (
    <span className={`truncate ${className}`}>
      <span className="sm:hidden font-display tracking-wide">{short}</span>
      <span className="hidden sm:inline">{full}</span>
    </span>
  );
}
