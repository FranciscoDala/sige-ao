import { useLocation } from 'react-router-dom'
import { School, X, User } from 'lucide-react'

type MenuItem = { icon: any; label: string; path: string; type: string }

interface SidebarProps {
    menuItems: MenuItem[]
    onNavigate: (path: string) => void
    onClose: () => void
    isOpen: boolean
    corPrimaria: string
    corSecundaria: string
    textPrimary: string
    textSecondary: string
    bgCard: string
    borderCard: string
    hoverBg: string
    cardClass: string
    user: any
    tema: any
}

export default function Sidebar({
    menuItems, onNavigate, onClose, isOpen,
    corPrimaria, corSecundaria, textPrimary, textSecondary,
    bgCard, borderCard, hoverBg, cardClass, user, tema
}: SidebarProps) {
    const location = useLocation()
    const estiloCard = tema?.estilo_card || 'arredondado'

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" onClick={onClose}></div>}

            <aside className={`fixed top-0 left-0 h-screen w-[80%] max-w-[280px] lg:w-[260px] p-3 z-50 transition-transform duration-300 ease-in-out ${isOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className={`${cardClass} p-4 h-full flex flex-col shadow-2xl shadow-black/20`}>
                    <div className="flex items-center justify-between mb-8 px-1">
                        <div className="flex items-center gap-3">
                            <School className="w-8 h-8 flex-shrink-0" style={{ color: corPrimaria }} />
                            <h1 className="text-xl font-bold whitespace-nowrap" style={{ color: textPrimary }}>SIGE</h1>
                            <span className="text-xs px-2 py-0.5 rounded-md font-semibold flex-shrink-0" style={{ backgroundColor: `${corPrimaria}33`, color: corPrimaria }}>Escola</span>
                        </div>
                        <button className={`lg:hidden p-2 ${hoverBg} rounded-lg transition`} onClick={onClose}>
                            <X className="w-5 h-5" style={{ color: textSecondary }} />
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1 overflow-y-auto">
                        {menuItems.map(item => {
                            const isActive = item.path === '/dashboard'? location.pathname === '/dashboard' : location.pathname.startsWith(item.path)
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => onNavigate(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition border ${isActive? 'font-semibold border-opacity-30' : `${hoverBg} border-transparent`}`}
                                    style={{
                                        backgroundColor: isActive? `${corPrimaria}20` : 'transparent',
                                        color: isActive? 'white' : textSecondary,
                                        borderColor: isActive? `${corPrimaria}4D` : 'transparent',
                                        borderRadius: estiloCard === 'quadrado'? '0.5rem' : estiloCard === 'minimalista'? '0.25rem' : '0.75rem'
                                    }}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive? 'white' : textSecondary }} />
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className={`border-t pt-4 mt-4`} style={{ borderColor: tema?.tema === 'claro'? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${corPrimaria}, ${corSecundaria})` }}>
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>{user.nome}</p>
                                <p className="text-xs truncate" style={{ color: textSecondary }}>{user.escola_nome || user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
