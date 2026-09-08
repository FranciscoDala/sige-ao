import { MouseEvent } from "react";
import {
    X,
    User,
    Mail,
    ShieldCheck,
    Building,
    BadgeCheck,
    Calendar,
} from "lucide-react";
import { UsuarioMinisterio } from "../../types/usuario";

interface UsuarioViewModalProps {
    open: boolean;
    onClose: () => void;
    usuario: UsuarioMinisterio | null;
}

const perfilLabels: Record<string, string> = {
    MINISTERIO: "Super Administrador",
    DIRETOR: "Diretor",
    super_admin: "Super Administrador",
    admin: "Administrador",
    suporte: "Suporte",
};

export default function UsuarioViewModal({
    open,
    onClose,
    usuario,
}: UsuarioViewModalProps) {
    if (!open || !usuario) return null;

    const perfilAtual = (usuario as any).perfil ?? usuario.nivel ?? "DIRETOR";

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        >
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl shadow-black/30 backdrop-blur-2xl"
            >
                <div className="flex items-center justify-between border-b border-white/10 p-5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/20">
                            <User className="h-5 w-5 text-[#3B82F6]" />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-white">Detalhes do Usuário</h2>
                            <p className="text-sm text-gray-400">Usuário do sistema</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 transition hover:bg-white/10"
                    >
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6]">
                            <User className="h-8 w-8 text-white" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white">{usuario.nome}</h3>

                            <span
                                className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${perfilAtual === "MINISTERIO" || perfilAtual === "super_admin"
                                        ? "border-red-500/30 bg-red-500/20 text-red-400"
                                        : perfilAtual === "DIRETOR" || perfilAtual === "admin"
                                            ? "border-blue-500/30 bg-blue-500/20 text-blue-400"
                                            : "border-green-500/30 bg-green-500/20 text-green-400"
                                    }`}
                            >
                                {perfilLabels[perfilAtual] ?? "Usuário"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                            <span className="text-gray-300">{usuario.email}</span>
                        </div>

                        {usuario.departamento && (
                            <div className="flex items-center gap-3 text-sm">
                                <Building className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                                <span className="text-gray-300">{usuario.departamento}</span>
                            </div>
                        )}

                        {usuario.telefone && (
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                                <span className="text-gray-300">{usuario.telefone}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-3 text-sm">
                            <BadgeCheck
                                className={`h-4 w-4 flex-shrink-0 ${usuario.ativo ? "text-green-400" : "text-red-400"
                                    }`}
                            />
                            <span
                                className={`font-semibold ${usuario.ativo ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {usuario.ativo ? "Ativo" : "Inativo"}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                            <span className="text-gray-400">
                                Criado em:{" "}
                                {usuario.created_at
                                    ? new Date(usuario.created_at).toLocaleDateString("pt-AO")
                                    : "Não informado"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
