import { Eye, Edit, Trash2, User, Mail, Phone, Building } from "lucide-react";
import { UsuarioMinisterio } from "../../types/usuario";

interface UsuarioCardProps {
    usuario: UsuarioMinisterio;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const getNivelLabel = (nivel: string) => {
    if (nivel === "MINISTERIO") return "Super Admin";
    if (nivel === "DIRETOR") return "Diretor";
    return "Usuário";
};

const getNivelColor = (nivel: string) => {
    if (nivel === "MINISTERIO")
        return "border-red-500/30 bg-red-500/20 text-red-400";
    if (nivel === "DIRETOR")
        return "border-[#8B5CF6]/30 bg-[#8B5CF6]/20 text-[#8B5CF6]";
    return "border-white/20 bg-white/10 text-gray-300";
};

export default function UsuarioCard({
    usuario,
    onView,
    onEdit,
    onDelete,
}: UsuarioCardProps) {
    const isDiretor = usuario.nivel === "DIRETOR";

    return (
        <div className="group w-full shrink-0 snap-center rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-2xl transition-all duration-300 hover:border-[#3B82F6]/60 hover:bg-white/10">
            <div className="mb-3 flex items-start gap-3">
                <div
                    className={`mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg ${isDiretor
                            ? "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-[#8B5CF6]/20"
                            : "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-[#3B82F6]/20"
                        }`}
                >
                    <User className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="break-words text-base font-bold leading-tight text-white">
                                {usuario.nome}
                            </h3>
                            <span
                                className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getNivelColor(
                                    usuario.nivel
                                )}`}
                            >
                                {getNivelLabel(usuario.nivel)}
                            </span>
                        </div>

                        <div
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${usuario.ativo ? "bg-green-400" : "bg-gray-500"
                                }`}
                        />
                    </div>

                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                            <span className="truncate break-words">{usuario.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <Building className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                            <span>{usuario.departamento || (isDiretor ? "Escola" : "Ministério")}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <User className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                            <span>{usuario.ativo ? "Ativo" : "Inativo"}</span>
                        </div>

                        {usuario.telefone && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#3B82F6]" />
                                <span>{usuario.telefone}</span>
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
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/15 p-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/30"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Apagar
                </button>
            </div>
        </div>
    );
}
