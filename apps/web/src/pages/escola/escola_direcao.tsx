import { useEffect, useState } from "react";
import {
    Building,
    Users,
    DoorOpen,
    BookOpen,
    Calendar,
    GraduationCap,
    Laptop,
    Loader2,
    Lock,
    Plus,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import AnoLetivoModal from "./components/modal_anoLetivo";
import PessoaModal, {
    PessoaCreatePayload,
} from "./components/modal_registro";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

type NivelEnsino =
    | "PRIMARIO"
    | "I_CICLO"
    | "II_CICLO"
    | "COMPLEXO"
    | "MEDIO_TECNICO"
    | "SUPERIOR";

type Tab = {
    id: string;
    label: string;
    icon: typeof Users;
};

type AnoLetivo = {
    id: number;
    nome: string;
    status: "ATIVO" | "FECHADO" | "PLANEJAMENTO";
    data_inicio: string;
    data_fim: string;
};

type EscolaOption = {
    id: string;
    nome: string;
};

type TurmaOption = {
    id: string;
    nome: string;
};

const TABS_POR_NIVEL: Record<NivelEnsino, Tab[]> = {
    PRIMARIO: [
        { id: "turmas", label: "Turmas", icon: Users },
        { id: "salas", label: "Salas", icon: DoorOpen },
        { id: "professores", label: "Professores", icon: Users },
        { id: "horarios", label: "Horários", icon: Calendar },
    ],
    I_CICLO: [
        { id: "turmas", label: "Turmas", icon: Users },
        { id: "salas", label: "Salas", icon: DoorOpen },
        { id: "professores", label: "Professores", icon: Users },
        { id: "disciplinas", label: "Disciplinas", icon: BookOpen },
        { id: "horarios", label: "Horários", icon: Calendar },
    ],
    II_CICLO: [
        { id: "turmas", label: "Turmas", icon: Users },
        { id: "salas", label: "Salas", icon: DoorOpen },
        { id: "professores", label: "Professores", icon: Users },
        { id: "disciplinas", label: "Disciplinas", icon: BookOpen },
        { id: "horarios", label: "Horários", icon: Calendar },
    ],
    COMPLEXO: [
        { id: "turmas", label: "Turmas", icon: Users },
        { id: "salas", label: "Salas", icon: DoorOpen },
        { id: "professores", label: "Professores", icon: Users },
        { id: "disciplinas", label: "Disciplinas", icon: BookOpen },
        { id: "horarios", label: "Horários", icon: Calendar },
    ],
    MEDIO_TECNICO: [
        { id: "turmas", label: "Turmas", icon: Users },
        { id: "cursos", label: "Cursos Técnicos", icon: Laptop },
        { id: "salas", label: "Salas/Labs", icon: DoorOpen },
        { id: "professores", label: "Professores", icon: Users },
        { id: "disciplinas", label: "Disciplinas", icon: BookOpen },
        { id: "horarios", label: "Horários", icon: Calendar },
    ],
    SUPERIOR: [
        { id: "cursos", label: "Cursos", icon: GraduationCap },
        { id: "disciplinas", label: "Disciplinas", icon: BookOpen },
        { id: "professores", label: "Docentes", icon: Users },
        { id: "salas", label: "Salas/Labs", icon: DoorOpen },
        { id: "horarios", label: "Horários", icon: Calendar },
    ],
};

const formatNivel = (nivel: string) => {
    return nivel
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function EscolaDirecaoPage() {
    const [nivel, setNivel] = useState<NivelEnsino>("PRIMARIO");
    const [tabs, setTabs] = useState<Tab[]>(TABS_POR_NIVEL.PRIMARIO);
    const [activeTab, setActiveTab] = useState("turmas");
    const [loading, setLoading] = useState(true);
    const [corPrimariaHex, setCorPrimariaHex] = useState("#0056b3");
    const [isClaro, setIsClaro] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const [savingAno, setSavingAno] = useState(false);
    const [modalAnoOpen, setModalAnoOpen] = useState(false);

    const [savingRegistro, setSavingRegistro] = useState(false);
    const [modalRegistroOpen, setModalRegistroOpen] = useState(false);

    const [escolasRegistro, setEscolasRegistro] = useState<
        EscolaOption[]
    >([]);

    const [turmasRegistro, setTurmasRegistro] = useState<
        TurmaOption[]
    >([]);

    const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([]);
    const [anoLetivoAtivo, setAnoLetivoAtivo] =
        useState<AnoLetivo | null>(null);

    const STORAGE_KEY_TAB = "direcao_active_tab";

    const carregarDados = async () => {
        setLoading(true);
        setErro(null);

        try {
            const [resEscola, resAnos] = await Promise.all([
                api.get("/escolas/me"),
                api.get("/anos-letivos"),
            ]);

            const nivelEscola =
                (resEscola.data.nivel_ensino as NivelEnsino) ||
                "PRIMARIO";

            setNivel(nivelEscola);
            setCorPrimariaHex(
                resEscola.data.cor_primaria || "#0056b3",
            );
            setIsClaro(resEscola.data.tema === "claro");

            const tabsDoNivel =
                TABS_POR_NIVEL[nivelEscola] ||
                TABS_POR_NIVEL.PRIMARIO;

            setTabs(tabsDoNivel);

            const listaAnos = Array.isArray(resAnos.data)
                ? resAnos.data
                : [];

            setAnosLetivos(listaAnos);

            const anoAtivo =
                listaAnos.find(
                    (ano: AnoLetivo) => ano.status === "ATIVO",
                ) ||
                listaAnos[0] ||
                null;

            setAnoLetivoAtivo(anoAtivo);

            const escolaAtual: EscolaOption = {
                id: String(resEscola.data.id),
                nome: String(resEscola.data.nome),
            };

            setEscolasRegistro([escolaAtual]);

            try {
                const resTurmas = await api.get("/turmas");

                const listaTurmas = Array.isArray(resTurmas.data)
                    ? resTurmas.data
                    : [];

                setTurmasRegistro(
                    listaTurmas.map((turma: TurmaOption) => ({
                        id: String(turma.id),
                        nome: turma.nome,
                    })),
                );
            } catch (turmaError) {
                console.error(
                    "Erro ao carregar turmas",
                    turmaError,
                );
                setTurmasRegistro([]);
            }

            const savedTab = localStorage.getItem(STORAGE_KEY_TAB);
            const isValidTab = tabsDoNivel.some(
                (tab) => tab.id === savedTab,
            );

            setActiveTab(
                isValidTab && savedTab
                    ? savedTab
                    : tabsDoNivel[0].id,
            );
        } catch (error: any) {
            console.error(
                "Erro ao buscar dados iniciais",
                error,
            );

            if (error.response?.status === 401) {
                setErro("Token expirado. Faça login novamente.");
            } else {
                setErro(
                    error.response?.data?.detail ||
                        "Erro ao carregar dados.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void carregarDados();
    }, []);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY_TAB, activeTab);
        }
    }, [activeTab, loading]);

    const handleSalvarAno = async (data: unknown) => {
        setSavingAno(true);

        try {
            await api.post("/anos-letivos", data);

            toast.success("Ano letivo criado com sucesso!");
            setModalAnoOpen(false);

            await carregarDados();
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ||
                    "Erro ao criar ano letivo.",
            );
        } finally {
            setSavingAno(false);
        }
    };

    const handleSalvarRegistro = async (
        data: PessoaCreatePayload,
    ) => {
        setSavingRegistro(true);

        try {
            await api.post("/pessoas/", data);

            toast.success("Registro criado com sucesso!");
            setModalRegistroOpen(false);
        } catch (error: any) {
            toast.error(
                error.response?.data?.detail ||
                    "Erro ao criar registro.",
            );
        } finally {
            setSavingRegistro(false);
        }
    };

    const corPrimaria = corPrimariaHex;
    const textPrimary = isClaro ? "#1E293B" : "white";
    const textSecondary = isClaro ? "#64748B" : "#9CA3AF";
    const bgCard = isClaro
        ? "rgba(0,0,0,0.03)"
        : "rgba(255,255,255,0.05)";
    const borderCard = isClaro
        ? "rgba(0,0,0,0.1)"
        : "rgba(255,255,255,0.1)";
    const bgActive = `${corPrimaria}20`;
    const borderActive = `${corPrimaria}4D`;
    const lineColor = `${corPrimaria}26`;

    if (loading) {
        return (
            <div className="flex justify-center p-6">
                <Loader2
                    className="h-6 w-6 animate-spin"
                    style={{ color: corPrimaria }}
                />
            </div>
        );
    }

    if (erro) {
        return (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {erro}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <Building
                            className="h-6 w-6"
                            style={{ color: corPrimaria }}
                        />

                        <div>
                            <h1
                                className="text-xl font-bold"
                                style={{ color: textPrimary }}
                            >
                                Direção Escolar
                            </h1>

                            <p
                                className="text-xs"
                                style={{ color: textSecondary }}
                            >
                                Ensino: {formatNivel(nivel)}

                                {anoLetivoAtivo && (
                                    <span>
                                        {" "}
                                        | {anoLetivoAtivo.nome} -{" "}
                                        {anoLetivoAtivo.status}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                        <button
                            type="button"
                            onClick={() =>
                                setModalRegistroOpen(true)
                            }
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition hover:scale-[1.02] sm:w-auto"
                            style={{
                                backgroundColor: corPrimaria,
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Novo Registro
                        </button>

                        <button
                            type="button"
                            onClick={() => setModalAnoOpen(true)}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition hover:scale-[1.02] sm:w-auto"
                            style={{
                                color: corPrimaria,
                                borderColor: `${corPrimaria}66`,
                                backgroundColor: bgCard,
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Novo Ano
                        </button>
                    </div>
                </div>

                {anoLetivoAtivo?.status === "FECHADO" && (
                    <div
                        className="flex items-center gap-2 rounded-xl border p-2.5"
                        style={{
                            backgroundColor: `${corPrimaria}10`,
                            borderColor: `${corPrimaria}30`,
                        }}
                    >
                        <Lock
                            className="h-3.5 w-3.5"
                            style={{ color: corPrimaria }}
                        />

                        <p
                            className="text-xs"
                            style={{ color: textPrimary }}
                        >
                            Ano letivo{" "}
                            <b>{anoLetivoAtivo.nome}</b> está fechado.
                            Modo apenas para consulta.
                        </p>
                    </div>
                )}

                <div className="w-full">
                    <div className="scrollbar-hide flex gap-2 overflow-x-auto p-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isFechado =
                                anoLetivoAtivo?.status === "FECHADO";

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(tab.id)
                                    }
                                    disabled={
                                        isFechado &&
                                        !["turmas"].includes(tab.id)
                                    }
                                    className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{
                                        backgroundColor: isActive
                                            ? bgActive
                                            : bgCard,
                                        color: isActive
                                            ? corPrimaria
                                            : textSecondary,
                                        borderColor: isActive
                                            ? borderActive
                                            : borderCard,
                                    }}
                                >
                                    <Icon
                                        className="h-3.5 w-3.5"
                                        style={{
                                            color: isActive
                                                ? corPrimaria
                                                : textSecondary,
                                        }}
                                    />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div
                        className="mt-2 h-0.5 w-full rounded-full"
                        style={{ backgroundColor: lineColor }}
                    />
                </div>

                <div className="rounded-2xl p-0">
                    {anoLetivoAtivo && (
                        <>
                            {activeTab === "turmas" && (
                                <div className="text-sm">
                                    Conteúdo de Turmas - ano_letivo_id:{" "}
                                    {anoLetivoAtivo.id}
                                </div>
                            )}

                            {activeTab === "cursos" && (
                                <div className="text-sm">
                                    Conteúdo de Cursos - ano_letivo_id:{" "}
                                    {anoLetivoAtivo.id}
                                </div>
                            )}

                            {activeTab === "salas" && (
                                <div className="text-sm">
                                    Conteúdo de Salas - ano_letivo_id:{" "}
                                    {anoLetivoAtivo.id}
                                </div>
                            )}

                            {activeTab === "professores" && (
                                <div className="text-sm">
                                    Conteúdo de Professores -
                                    ano_letivo_id:{" "}
                                    {anoLetivoAtivo.id}
                                </div>
                            )}

                            {activeTab === "disciplinas" && (
                                <div className="text-sm">
                                    Conteúdo de Disciplinas -
                                    ano_letivo_id:{" "}
                                    {anoLetivoAtivo.id}
                                </div>
                            )}

                            {activeTab === "horarios" && (
                                <div className="text-sm">
                                    Conteúdo de Horários - ano_letivo_id:{" "}
                                    {anoLetivoAtivo.id}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <style>
                    {`
                        .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                        }

                        .scrollbar-hide {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}
                </style>
            </div>

            <PessoaModal
                open={modalRegistroOpen}
                onClose={() => setModalRegistroOpen(false)}
                onSave={handleSalvarRegistro}
                saving={savingRegistro}
                pessoa={null}
                escolas={escolasRegistro}
                turmas={turmasRegistro}
            />

            <AnoLetivoModal
                open={modalAnoOpen}
                onClose={() => setModalAnoOpen(false)}
                onSave={handleSalvarAno}
                saving={savingAno}
                ano={null}
            />
        </>
    );
}
