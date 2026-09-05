import { useState } from 'react'
import { Menu } from 'lucide-react' // botão pra abrir no mobile
import Sidebar from './components/sidebar'

export default function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-[#020617]">
            {/* Sidebar Separada */}
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Conteúdo Principal */}
            <div className="flex-1 flex-col">
                {/* Header Mobile com botão de menu */}
                <header className="md:hidden p-4 flex items-center justify-between border-b border-white/10 bg-[#0F172A]/50 backdrop-blur-xl">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-white/5">
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                    <div className="flex gap-2">
                        {/* seus icones de busca, notificação, logout */}
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                    {/* Aqui entra todo o conteúdo do dashboard que você já tem */}
                </main>
            </div>
        </div>
    )
}
