import { ShieldCheck, LogOut, Menu, Search, Bell } from 'lucide-react'

interface Props {
    onLogout: () => void
    onOpenMenu: () => void // 👈 pra abrir a sidebar no mobile
}

export default function Header({ onLogout, onOpenMenu }: Props) {
    return (
        <header className="sticky top-0 z-30 bg-[#0F172A]/60 backdrop-blur-xl border-b border-white/10">
            <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">

                {/* Lado Esquerdo: Menu + Logo */}
                <div className="flex items-center gap-3">
                    {/* Botão Menu só no mobile */}
                    <button
                        onClick={onOpenMenu}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 md:hidden"
                    >
                        <Menu className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#CF0921] to-[#FFD700] rounded-xl flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-white leading-tight">SIGE-AO</h1>
                            <p className="text-xs text-white/60 hidden sm:block">Painel Administrativo</p>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Ações */}
                <div className="flex items-center gap-2">
                    {/* Ícones extras como na tua imagem */}
                    <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition">
                        <Search className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition">
                        <Bell className="w-5 h-5 text-white" />
                    </button>

                    {/* Botão Sair: só ícone no mobile, texto no desktop */}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 p-2.5 md:px-4 md:py-2 bg-red-500/15 hover:bg-red-500/30 border-red-500/20 rounded-xl text-red-400 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline text-sm font-semibold">Sair</span>
                    </button>
                </div>
            </div>
        </header>
    )
}
