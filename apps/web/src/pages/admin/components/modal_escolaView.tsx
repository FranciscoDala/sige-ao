import { useEffect, MouseEvent } from "react";
import {
    X,
    Building2,
    MapPin,
    Phone,
    FileText,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    Edit,
    Trash2,
    Eye,
} from "lucide-react";
import { Escola } from "./modal_escola";

interface Props {
    open: boolean;
    onClose: () => void;
    escola: Escola | null;
    onEdit?: () => void;
    onToggleStatus?: () => void;
}

export default function EscolaViewModal({
    open,
    onClose,
    escola,
    onEdit,
    onToggleStatus,
}: Props) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [open, onClose]);

    if (!open || !escola) return null;

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const stats = [
        { label: "Alunos", value: "1,240", icon: Users, color: "text-[#3B82F6]" },
        { label: "Professores", value: "86", icon: GraduationCap, color: "text-[#10B981]" },
        { label: "Turmas", value: "42", icon: BookOpen, color: "text-[#8B5CF6]" },
        { label: "Ano Letivo", value: "2026", icon: Calendar, color: "text-[#F59E0B]" },
    ];

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="flex max-h-[90vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-2xl"
            >
                <div className="shrink-0 border-b border-white/10 p-5 pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                                {escola.logo_url ? (
                                    <img
                                        src={escola.logo_url}
                                        alt={escola.nome}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="h-8 w-8 text-[#3B82F6]" />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white">{escola.nome}</h2>

                                    <span
                                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${escola.ativo
                                                ? "bg-[#10B981]/15 text-[#10B981]"
                                                : "bg-red-500/15 text-red-400"
                                            }`}
                                    >
                                        <div
                                            className={`h-2 w-2 rounded-full ${escola.ativo ? "bg-[#10B981]" : "bg-red-400"
                                                }`}
                                        />
                                        {escola.ativo ? "Ativa" : "Inativa"}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-gray-400">
                                    {escola.sigla || "Sem sigla"} • ID: {escola.id}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="shrink-0 rounded-lg p-2 transition hover:bg-white/10"
                        >
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {stats.map((stat, i) => {
                                const Icon = stat.icon;

                                return (
                                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Icon className={`h-4 w-4 ${stat.color}`} />
                                            <p className="text-xs text-gray-400">{stat.label}</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                                    <MapPin className="h-4 w-4 text-[#3B82F6]" />
                                    Localização
                                </h3>

                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-gray-500">Província:</span>{" "}
                                        {escola.provincia || "-"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-gray-500">Município:</span>{" "}
                                        {escola.municipio || "-"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-gray-500">Endereço:</span>{" "}
                                        {escola.endereco || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                                    <Phone className="h-4 w-4 text-[#3B82F6]" />
                                    Contato
                                </h3>

                                <div className="space-y-1 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-gray-500">Telefone:</span>{" "}
                                        {escola.telefone || "-"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-gray-500">NIF:</span> {escola.nif || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                                <Eye className="h-4 w-4 text-[#3B82F6]" />
                                Identidade Visual
                            </h3>

                            <div className="flex flex-wrap items-center gap-4">
                                <div>
                                    <p className="mb-1 text-xs text-gray-500">Cor Primária</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-8 w-8 rounded-lg border border-white/10"
                                            style={{ backgroundColor: escola.cor_primaria || "#3B82F6" }}
                                        />
                                        <span className="text-sm text-gray-300">
                                            {escola.cor_primaria || "#3B82F6"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs text-gray-500">Cor Secundária</p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-8 w-8 rounded-lg border border-white/10"
                                            style={{ backgroundColor: escola.cor_secundaria || "#8B5CF6" }}
                                        />
                                        <span className="text-sm text-gray-300">
                                            {escola.cor_secundaria || "#8B5CF6"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs text-gray-500">Tema</p>
                                    <span className="text-sm font-medium text-gray-300">
                                        {escola.tema || "escuro"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <h3 className="mb-3 text-sm font-bold text-white">Ações Rápidas</h3>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                                >
                                    <Users className="h-4 w-4" />
                                    Usuários
                                </button>

                                <button
                                    type="button"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    Turmas
                                </button>

                                <button
                                    type="button"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                                >
                                    <FileText className="h-4 w-4" />
                                    Relatórios
                                </button>

                                <button
                                    type="button"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                                >
                                    <Building2 className="h-4 w-4" />
                                    Configurações
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 bg-[#0F172A]/90 p-4 sm:flex-row">
                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        <Edit className="h-4 w-4" />
                        Editar Escola
                    </button>

                    <button
                        type="button"
                        onClick={onToggleStatus}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/15 px-6 text-sm font-semibold text-red-400 transition hover:bg-red-500/30"
                    >
                        <Trash2 className="h-4 w-4" />
                        {escola.ativo ? "Desativar" : "Ativar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
