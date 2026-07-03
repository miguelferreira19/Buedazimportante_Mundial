import Link from "next/link";
import Emblem from "@/components/Emblem";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="card p-8 text-center max-w-sm">
        <Emblem size={48} />
        <p className="eyebrow mt-4">Erro 404</p>
        <p className="display text-lg mt-1.5">Esta página não existe</p>
        <p className="text-sm text-muted mt-1.5 leading-relaxed">
          O link pode estar errado ou a página foi movida. Volta aos teus
          palpites.
        </p>
        <Link href="/palpites" className="btn btn-primary mt-5">
          Ir para os palpites
        </Link>
      </div>
    </div>
  );
}
