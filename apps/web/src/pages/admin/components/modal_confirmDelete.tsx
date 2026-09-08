import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDeleteModal({
    open,
    onClose,
    onConfirm,
}: ConfirmDeleteModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="w-full max-w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20">
                            <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
                        </div>
                        <h2 className="text-base font-bold text-white">Confirmar Exclusão</h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 transition hover:bg-white/10"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                </div>

                <div className="p-4">
                    <p className="text-sm leading-relaxed text-gray-300">
                        Tem certeza que deseja <span className="font-bold text-red-400">apagar</span>{" "}
                        esta escola?
                        <br />
                        <span className="text-xs text-gray-400">
                            Esta ação não pode ser desfeita.
                        </span>
                    </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-[#0F172A]/90 p-3 sm:flex-row">
                    <button
                        onClick={onClose}
                        className="order-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:order-1 sm:w-auto sm:flex-1"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="order-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 sm:order-2 sm:w-auto sm:flex-1"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Apagar
                    </button>
                </div>
            </div>
        </div>
    );
}
