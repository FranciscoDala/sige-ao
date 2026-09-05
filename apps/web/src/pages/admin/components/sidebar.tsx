import { ShieldCheck, X, LayoutGrid, Building2, Settings } from 'lucide-react'

interface SidebarProps {
    open: boolean
    onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const menu = [
        { label: 'Visão Geral', icon: LayoutGrid, active: true },
        { label: 'Gerenciar Escolas', icon: Building2 },
        { label: 'Configurações', icon: Settings },
    ]

    return (
        <>
            {/* OVERLAY - só aparece no mobile quando aberto */}
            {open && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full
                w-full md:w-64 /* 👈 100% no mobile, 256px no desktop */
                bg-[#0F172A]/95 backdrop-blur-2xl border-r border-white/10
                transition-transform duration-300 ease-in-out
                ${open? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 /* 👈 desktop sempre aberto */
            `}>
                {/* HEADER DO MENU */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-[#3B82F6]" />
                        <h1 className="text-xl font-bold text-white">SIGE</h1>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-[#3B82F6]/20 text-[#3B82F6] rounded-md">Admin</span>
                    </div>
                    {/* BOTÃO X - só no mobile */}
                    <button onClick={onClose} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* MENU */}
                <nav className="p-4 space-y-1">
                    {menu.map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
                                ${item.active
                                   ? 'bg-white/10 text-white font-semibold'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    )
}
