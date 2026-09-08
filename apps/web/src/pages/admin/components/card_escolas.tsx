import {
    Eye,
    Edit,
    Trash2,
    School,
    Phone,
    MapPin,
    Hash,
    GraduationCap,
    User,
} from "lucide-react";

import { Escola } from "./modal_escola";
import { UsuarioMinisterio } from "../../types/usuario";

const NIVEL_LABELS: Record<string, string> = {
    PRIMARIO: "Primário",
    I_CICLO: "I Ciclo",
    II_CICLO: "II Ciclo",
    COMPLEXO: "Complexo",
    MEDIO_TECNICO: "Médio Técnico",
    SUPERIOR: "Superior",
};

interface EscolaCardProps {
    escola: Escola;
    diretor?: UsuarioMinisterio | null;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function EscolaCard({
    escola,
    diretor,
    onView,
    onEdit,
    onDelete,
}: EscolaCardProps) {
    return (
        <div className="group w-full shrink-0 snap-center rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-2xl transition-all duration-300 hover:border-[#3B82F6]/60 hover:bg-white/10">
            <div className="mb-3 flex items-start gap-3">
                <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] shadow-lg shadow-[#3B82F6]/20">
                    {escola.logo_url ? (
                        <img
                            src={escola.logo_url}
                            alt={escola.nome}
                            className="h-full w-full rounded-xl object-cover"
                        />
                    ) : (
                        <School className="h-5 w-5 text-white" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="break-words text-base font-bold leading-tight text-white">
                                {escola.nome}
                            </h3>
                            <p className="text-xs font-semibold text-[#3B82F6]">
                                {escola.sigla || `ID: ${escola.id}`}
                            </p>
                        </div>

                        <span
                            className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${escola.ativo
                                    ? "border-green-500/30 bg-green-500/20 text-green-400"
                                    : "border-red-500/30 bg-red-500/20 text-red-400"
                                }`}
                        >
                            {escola.ativo ? "Ativa" : "Inativa"}
                        </span>
                    </div>

                    {escola.nivel_ensino && (
                        <div className="mb-2 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-lg border border-[#8B5CF6]/30 bg-[#8B5CF6]/20 px-2 py-0.5 text-[11px] font-semibold text-[#8B5CF6]">
                                <GraduationCap className="h-3 w-3" />
                                {NIVEL_LABELS[escola.nivel_ensino] || escola.nivel_ensino}
                            </span>
                        </div>
                    )}

                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-300">
                        <User className="h-3.5 w-3.5 flex-shrink-0 text-[#8B5CF6]" />
                        <span className="truncate">
                            Diretor: {diretor?.nome || "Não definido"}
                        </span>
                    </div>

                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                            <span className="break-words">
                                {escola.provincia || "N/A"} - {escola.municipio || "N/A"}
                            </span>
                        </div>

                        {escola.telefone && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                                <span>{escola.telefone}</span>
                            </div>
                        )}

                        {escola.nif && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Hash className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                                <span>NIF: {escola.nif}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <button
                    onClick={onView}
                    className="hidden w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                </button>

                <button
                    onClick={onEdit}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#8B5CF6]/20 bg-[#8B5CF6]/15 p-2 text-xs font-semibold text-[#8B5CF6] transition hover:bg-[#8B5CF6]/30"
                >
                    <Edit className="h-3.5 w-3.5" />
                    Editar
                </button>

                <button
                    onClick={onDelete}
                    className="col-span-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/15 p-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/30"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Apagar
                </button>
            </div>
        </div>
    );
}
