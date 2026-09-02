import { ShieldCheck, LogOut } from 'lucide-react'

interface Props {
    onLogout: () => void
}

export default function Header({ onLogout }: Props) {
    return (
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#CF0921] to-[#FFD700] rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">SIGE-AO</h1>
                        <p className="text-xs text-white/60">Painel Administrativo</p>
                    </div>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white">
                    <LogOut className="w-4 h-4" /> Sair
                </button>
            </div>
        </header>
    )
}
