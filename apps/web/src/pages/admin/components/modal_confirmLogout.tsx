import { AlertTriangle, X, Power } from 'lucide-react'

interface ConfirmLogoutModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function ConfirmLogoutModal({ open, onClose, onConfirm }: ConfirmLogoutModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            {/* LARGURA MENOR: max-w-md -> max-w-[380px] */}
            <div className="w-full max-w-[380px] bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

                {/* HEADER MAIS COMPACTO: p-6 -> p-4 pb-3 */}
                <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {/* ICONE MENOR: w-10 h-10 -> w-9 h-9 | w-5 -> w-4.5 */}
                        <div className="w-9 h-9 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-4.5 h-4.5 text-yellow-400" />
                        </div>
                        {/* TITULO MENOR: text-lg -> text-base */}
                        <h2 className="text-base font-bold text-white">Confirmar Saída</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition"><X className="w-4 h-4 text-gray-400" /></button>
                </div>

                {/* BODY MAIS COMPACTO: p-6 -> p-4 */}
                <div className="p-4">
                    {/* TEXTO MENOR: leading-relaxed -> text-sm */}
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Tem certeza que deseja <span className="font-bold text-yellow-400">terminar sessão</span>?
                        <br />
                        <span className="text-xs text-gray-400">Você precisará fazer login novamente.</span>
                    </p>
                </div>

                {/* FOOTER PADRONIZADO: p-6 -> p-3, h-11 -> h-10, flex-col sm:flex-row, order, border */}
                <div className="p-3 border-t border-white/10 flex-col sm:flex-row gap-3 shrink-0 bg-[#0F172A]/90">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto sm:flex-1 px-4 h-10 font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition text-sm order-2 sm:order-1"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full sm:w-auto sm:flex-1 h-10 font-bold rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition text-sm order-1 sm:order-2"
                    >
                        <Power className="w-3.5 h-3.5" /> Sair
                    </button>
                </div>
            </div>
        </div>
    )
}
