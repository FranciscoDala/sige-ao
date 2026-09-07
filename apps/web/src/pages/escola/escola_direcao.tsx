import React, { useState, useEffect } from 'react'
import { Building, Users, DoorOpen, BookOpen, Calendar, GraduationCap, FlaskConical, Laptop, Loader2 } from 'lucide-react' // 👈 add Loader2
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

type NivelEnsino = 'PRIMARIO' | 'I_CICLO' | 'II_CICLO' | 'COMPLEXO' | 'MEDIO_TECNICO' | 'SUPERIOR'
type Tab = { id: string; label: string; icon: any }

const TABS_POR_NIVEL: Record<NivelEnsino, Tab[]> = {
    PRIMARIO: [
        { id: 'turmas', label: 'Turmas', icon: Users },
        { id: 'salas', label: 'Salas', icon: DoorOpen },
        { id: 'professores', label: 'Professores', icon: Users },
        { id: 'horarios', label: 'Horários', icon: Calendar },
    ],
    I_CICLO: [
        { id: 'turmas', label: 'Turmas', icon: Users },
        { id: 'salas', label: 'Salas', icon: DoorOpen },
        { id: 'professores', label: 'Professores', icon: Users },
        { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
        { id: 'horarios', label: 'Horários', icon: Calendar },
    ],
    II_CICLO: [
        { id: 'turmas', label: 'Turmas', icon: Users },
        { id: 'salas', label: 'Salas', icon: DoorOpen },
        { id: 'professores', label: 'Professores', icon: Users },
        { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
        { id: 'horarios', label: 'Horários', icon: Calendar },
    ],
    COMPLEXO: [
        { id: 'turmas', label: 'Turmas', icon: Users },
        { id: 'salas', label: 'Salas', icon: DoorOpen },
        { id: 'professores', label: 'Professores', icon: Users },
        { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
        { id: 'horarios', label: 'Horários', icon: Calendar },
    ],
    MEDIO_TECNICO: [
        { id: 'turmas', label: 'Turmas', icon: Users },
        { id: 'cursos', label: 'Cursos Técnicos', icon: Laptop },
        { id: 'salas', label: 'Salas/Labs', icon: DoorOpen },
        { id: 'professores', label: 'Professores', icon: Users },
        { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
        { id: 'horarios', label: 'Horários', icon: Calendar },
    ],
    SUPERIOR: [
        { id: 'cursos', label: 'Cursos', icon: GraduationCap },
        { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
        { id: 'professores', label: 'Docentes', icon: Users },
        { id: 'salas', label: 'Salas/Labs', icon: DoorOpen },
        { id: 'horarios', label: 'Horários', icon: Calendar },
    ],
}

export default function EscolaDirecaoPage() {
    const [nivel, setNivel] = useState<NivelEnsino>('PRIMARIO')
    const [tabs, setTabs] = useState<Tab[]>(TABS_POR_NIVEL.PRIMARIO)
    const [activeTab, setActiveTab] = useState('turmas')
    const [loading, setLoading] = useState(true)

    const STORAGE_KEY = 'direcao_active_tab'

    useEffect(() => {
        const fetchNivel = async () => {
            try {
                const res = await api.get('/escolas/me')
                const nivelEscola = res.data.nivel_ensino as NivelEnsino
                setNivel(nivelEscola)
                const tabsDoNivel = TABS_POR_NIVEL[nivelEscola] || TABS_POR_NIVEL.PRIMARIO
                setTabs(tabsDoNivel)

                const savedTab = localStorage.getItem(STORAGE_KEY)
                const isValidTab = tabsDoNivel.some(t => t.id === savedTab)
                setActiveTab(isValidTab ? savedTab! : tabsDoNivel[0].id)

            } catch (e) {
                console.error("Erro ao buscar nivel", e)
            } finally {
                setLoading(false)
            }
        }
        fetchNivel()
    }, [])

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, activeTab)
        }
    }, [activeTab, loading])

    const corPrimaria = 'var(--cor-primaria)'
    const textPrimary = 'var(--text-primary)'
    const textSecondary = 'var(--text-secondary)'
    const bgCard = 'var(--bg-card, rgba(255,255,255,0.05))'

    // 👇 SPINNER COM COR DO DB
    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: corPrimaria }} />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Building className="w-7 h-7" style={{ color: corPrimaria }} />
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Direção Escolar</h1>
                    <p style={{ color: textSecondary }}>
                        Ensino: {nivel.replace('_', ' ')}
                    </p>
                </div>
            </div>

            {/* Tabs - Com bg sutil nas inativas */}
            <div className="w-full">
                <div className="flex gap-2 p-0 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 border shadow-sm"
                                style={{
                                    backgroundColor: isActive ? `${corPrimaria}20` : 'rgba(0,0,0,0.03)',
                                    color: isActive ? corPrimaria : textSecondary,
                                    borderColor: isActive ? `${corPrimaria}4D` : 'rgba(0,0,0,0.08)'
                                }}
                            >
                                <Icon className="w-4 h-4" style={{ color: isActive ? corPrimaria : textSecondary }} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
                {/* Linha de baixo 15% */}
                <div className="h-0.5 w-full mt-2 rounded-full" style={{ backgroundColor: `${corPrimaria}26` }} />
            </div>

            {/* Conteúdo da Tab */}
            <div className="rounded-2xl p-4" style={{ background: bgCard, border: '1px solid var(--border-card)' }}>
                {activeTab === 'turmas' && <div>Conteúdo de Turmas aqui</div>}
                {activeTab === 'cursos' && <div>Conteúdo de Cursos aqui</div>}
                {activeTab === 'salas' && <div>Conteúdo de Salas aqui</div>}
                {activeTab === 'professores' && <div>Conteúdo de Professores aqui</div>}
                {activeTab === 'disciplinas' && <div>Conteúdo de Disciplinas aqui</div>}
                {activeTab === 'horarios' && <div>Conteúdo de Horários aqui</div>}
            </div>

            <style>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
