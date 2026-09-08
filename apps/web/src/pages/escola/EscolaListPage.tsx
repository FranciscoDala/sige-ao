import { useState, useEffect } from "react";
import { useEscolas, useCreateEscola } from "./hooks/useEscolas";
import { Button } from "../../components/ui/button";
import { Plus, Building2, Loader2 } from "lucide-react";
import { Badge } from "../../components/ui/badge";

type TemaEscola = {
  cor_primaria?: string;
  cor_secundaria?: string;
  estilo_card?: "arredondado" | "quadrado" | "minimalista" | "elevado" | "borda_colorida" | "glass";
  tema?: "claro" | "escuro";
};

export default function EscolaListPage() {
  const { data: escolas, isLoading } = useEscolas();
  const createEscola = useCreateEscola();

  const [tema, setTema] = useState<TemaEscola | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    const loadTema = () => {
      const raw = localStorage.getItem("escola_tema");
      if (!raw) {
        setTema(null);
        return;
      }

      try {
        setTema(JSON.parse(raw));
      } catch {
        setTema(null);
      }
    };

    loadTema();
    window.addEventListener("escola-tema-updated", loadTema);

    return () => {
      window.removeEventListener("escola-tema-updated", loadTema);
    };
  }, []);

  const corPrimaria = tema?.cor_primaria || "#3B82F6";
  const corSecundaria = tema?.cor_secundaria || "#8B5CF6";
  const estiloCard = tema?.estilo_card || "arredondado";
  const isClaro = tema?.tema === "claro";

  const getCardStyle = () => {
    const baseClaro = "border border-black/10 bg-white";
    const baseEscuro = "border border-white/10 bg-white/5 backdrop-blur-xl";
    const base = isClaro ? baseClaro : baseEscuro;

    if (estiloCard === "quadrado") return `${base} rounded-lg`;
    if (estiloCard === "minimalista") return `${base} rounded-sm border-0`;
    if (estiloCard === "elevado") return `${base} rounded-2xl shadow-xl`;
    if (estiloCard === "borda_colorida") return `${base} rounded-2xl border-2 border-[${corPrimaria}]`;
    if (estiloCard === "glass") {
      return isClaro
        ? "rounded-2xl border border-black/10 bg-white"
        : "rounded-2xl border border-white/10 bg-white/10 backdrop-blur-2xl";
    }

    return `${base} rounded-2xl`;
  };

  const textPrimary = isClaro ? "#1E293B" : "#FFFFFF";
  const textSecondary = isClaro ? "#475569" : "#9CA3AF";
  const hoverBg = isClaro ? "hover:bg-black/5" : "hover:bg-white/10";

  const handleNovaEscola = () => {
    setOpenCreate(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: corPrimaria }} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 lg:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1
          className="flex items-center gap-2 text-xl font-bold"
          style={{ color: textPrimary }}
        >
          <Building2 className="h-5 w-5" style={{ color: corPrimaria }} />
          Gestão de Escolas
        </h1>

        <Button
          onClick={handleNovaEscola}
          className="flex h-10 w-full items-center justify-center gap-2 px-4 text-sm font-semibold transition hover:opacity-90 lg:w-auto"
          style={{
            background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
            color: "white",
            borderRadius:
              estiloCard === "quadrado"
                ? "0.5rem"
                : estiloCard === "minimalista"
                  ? "0.25rem"
                  : "0.75rem",
          }}
        >
          <Plus className="h-3.5 w-3.5 text-white" />
          Nova Escola
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {escolas?.length === 0 && (
          <div className={`${getCardStyle()} col-span-full p-4`}>
            <p className="text-center text-sm" style={{ color: textSecondary }}>
              Nenhuma escola cadastrada
            </p>
          </div>
        )}

        {escolas?.map((escola: any) => (
          <div
            key={escola.id}
            className={`${getCardStyle()} ${hoverBg} cursor-pointer p-4 transition`}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${corPrimaria}20` }}
              >
                <Building2 className="h-5 w-5" style={{ color: corPrimaria }} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold"
                  style={{ color: textPrimary }}
                >
                  {escola.nome}
                </p>
                <p className="truncate text-xs" style={{ color: textSecondary }}>
                  {escola.sigla || "Sem sigla"} • {escola.provincia || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Badge
                style={{ backgroundColor: `${corPrimaria}20`, color: corPrimaria }}
                className="px-2 py-0.5 text-[10px]"
              >
                {escola.nivel_ensino || "N/A"}
              </Badge>

              <Badge
                variant={escola.ativo ? "default" : "secondary"}
                className="px-2 py-0.5 text-[10px]"
              >
                {escola.ativo ? "Ativa" : "Inativa"}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Se tiver modal de cadastro, abre aqui */}
      {openCreate && (
        <div className="hidden" />
      )}
    </div>
  );
}
