import { X, Shield, LayoutGrid, Building2, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
    open: boolean
    onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const menu = [
        { label: 'Visão Geral', icon: LayoutGrid, href: '/' },
        { label: 'Gerenciar Escolas', icon: Building2, href: '/escolas' },
        { label: 'Configurações', icon: Settings, href: '/config' },
    ]

    return (
        <>
            {/* Overlay só no mobile */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity md:hidden ${open? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar / Drawer */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full bg-[#0F172A]/90 backdrop-blur-2xl border-r border-[#3B82F6]/20
                transition-transform duration-300 ease-in-out
                ${open? 'translate-x-0' : '-translate-x-full'}

                w-full sm:w-[80%] md:w-64 lg:w-72
                md:relative md:translate-x-0
            `}>
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">SIGE</h2>
                    </div>
                    {/* Botão X só no mobile */}
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg md:hidden">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Menu */}
                <nav className="p-4 space-y-1">
                    {menu.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.href}
                            onClick={onClose}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition
                                ${isActive? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    )
}
