import React, { useState, useEffect } from 'react'
import { Building, Users, DoorOpen, BookOpen, Calendar, GraduationCap, FlaskConical, Laptop } from 'lucide-react'
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

// Regras por nível
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

                // 👇 Pega aba salva ou usa a primeira do nível
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

    // 👇 Salva aba sempre que mudar
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY, activeTab)
        }
    }, [activeTab, loading])

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Carregando...</div>

    const corPrimaria = 'var(--cor-primaria)'
    const textPrimary = 'var(--text-primary)'
    const textSecondary = 'var(--text-secondary)'
    const bgCard = 'var(--bg-card, rgba(255,255,255,0.05))'

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
    }

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
            {/* Tabs com background */}
            <div className="w-full">
                <div
                    className="flex gap-2 p-1 rounded-xl overflow-x-auto scrollbar-hide"
                    style={{
                        backgroundColor: bgCard,
                        border: '1px solid var(--border-card)'
                    }}
                >
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex-shrink-0"
                                style={{
                                    backgroundColor: isActive ? corPrimaria : 'transparent', // 👈 transparente se inativo
                                    color: isActive ? 'white' : textSecondary
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
                {/* Linha de baixo com opacidade menor */}
                <div className="h-0.5 w-full mt-1 rounded-full" style={{ backgroundColor: `${corPrimaria}4D` }} /> {/* 👈 30% opacity */}
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
                /* Esconde scrollbar no mobile */
               .scrollbar-hide::-webkit-scrollbar { display: none; }
               .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
