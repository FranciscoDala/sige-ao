import { AlertTriangle, X, LogOut } from 'lucide-react'

interface ConfirmLogoutModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
}

export default function ConfirmLogoutModal({ open, onClose, onConfirm }: ConfirmLogoutModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-md bg-[#0F172A]/90 backdrop-blur-2xl border-2 border-[#3B82F6]/40 rounded-2xl shadow-2xl shadow-[#3B82F6]/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Confirmar Saída</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-6">
                    <p className="text-gray-300 leading-relaxed">
                        Tem certeza que deseja <span className="font-bold text-yellow-400">terminar sessão</span>?
                        <br />
                        <span className="text-sm text-gray-400">Você precisará fazer login novamente.</span>
                    </p>
                </div>
                <div className="p-6 border-t border-white/10 flex gap-3 bg-[#0F172A]/50">
                    <button onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-white transition">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="w-full h-11 font-bold rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20 transition">
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>
            </div>
        </div>
    )
}
