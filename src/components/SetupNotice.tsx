export default function SetupNotice() {
  return (
    <div className="card p-6 space-y-3">
      <h2 className="display text-2xl">Falta configurar a base de dados</h2>
      <p className="text-muted text-sm leading-relaxed">
        Ainda não estão definidas as variáveis de ambiente. Define{" "}
        <code className="text-fg">SUPABASE_URL</code>,{" "}
        <code className="text-fg">SUPABASE_SERVICE_ROLE_KEY</code> e{" "}
        <code className="text-fg">SESSION_SECRET</code>, e corre o SQL que está
        em <code className="text-fg">supabase/schema.sql</code>.
      </p>
      <p className="text-muted text-sm">
        Tens o passo-a-passo completo no <code className="text-fg">README.md</code>.
      </p>
    </div>
  );
}
