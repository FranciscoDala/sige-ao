import React, { useState, useEffect } from 'react'
import { Building, Users, DoorOpen, BookOpen, Calendar, GraduationCap, Laptop, Loader2, ChevronDown, Lock } from 'lucide-react'
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
type AnoLetivo = { id: number; nome: string; status: 'ATIVO' | 'FECHADO' | 'PLANEJAMENTO'; data_inicio: string; data_fim: string }

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

const getStatusBadge = (status: AnoLetivo['status']) => {
    if (status === 'ATIVO') return 'bg-green-100 text-green-700'
    if (status === 'FECHADO') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
}

export default function EscolaDirecaoPage() {
    const [nivel, setNivel] = useState<NivelEnsino>('PRIMARIO')
    const [tabs, setTabs] = useState<Tab[]>(TABS_POR_NIVEL.PRIMARIO)
    const [activeTab, setActiveTab] = useState('turmas')
    const [loading, setLoading] = useState(true)
    const [corPrimariaHex, setCorPrimariaHex] = useState('#0056b3')

    const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
    const [anoLetivoAtivo, setAnoLetivoAtivo] = useState<AnoLetivo | null>(null)

    const STORAGE_KEY_TAB = 'direcao_active_tab'
    const STORAGE_KEY_ANO = 'direcao_active_ano'

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resEscola, resAnos] = await Promise.all([
                    api.get('/escolas/me'),
                    api.get('/anos-letivos')
                ])

                const nivelEscola = resEscola.data.nivel_ensino as NivelEnsino
                setNivel(nivelEscola)
                setCorPrimariaHex(resEscola.data.cor_primaria || '#0056b3')
                const tabsDoNivel = TABS_POR_NIVEL[nivelEscola] || TABS_POR_NIVEL.PRIMARIO
                setTabs(tabsDoNivel)
                setAnosLetivos(resAnos.data)

                const anoSalvoId = localStorage.getItem(STORAGE_KEY_ANO)
                const anoAtivo = resAnos.data.find((a: AnoLetivo) => a.status === 'ATIVO')
                const anoSelecionado = anoSalvoId? resAnos.data.find((a: AnoLetivo) => a.id === Number(anoSalvoId)) : anoAtivo
                setAnoLetivoAtivo(anoSelecionado || anoAtivo || resAnos.data[0] || null)

                const savedTab = localStorage.getItem(STORAGE_KEY_TAB)
                const isValidTab = tabsDoNivel.some(t => t.id === savedTab)
                setActiveTab(isValidTab? savedTab! : tabsDoNivel[0].id)

            } catch (e) {
                console.error("Erro ao buscar dados iniciais", e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY_TAB, activeTab)
            if (anoLetivoAtivo) localStorage.setItem(STORAGE_KEY_ANO, String(anoLetivoAtivo.id))
        }
    }, [activeTab, anoLetivoAtivo, loading])

    const corPrimaria = corPrimariaHex
    const textPrimary = 'var(--text-primary)'
    const textSecondary = 'var(--text-secondary)'

    const bgActive = `${corPrimaria}20`
    const bgInactive = 'rgba(0,0,0,0.03)'
    const borderActive = `${corPrimaria}4D`
    const borderInactive = 'rgba(0,0,0,0.08)'
    const lineColor = `${corPrimaria}26`

    if (loading) return (
        <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: corPrimaria }} />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header + Seletor Ano Letivo */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Building className="w-7 h-7" style={{ color: corPrimaria }} />
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Direção Escolar</h1>
                        <p style={{ color: textSecondary }}>
                            Ensino: {nivel.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                {/* SELETOR DE ANO LETIVO */}
                <div className="relative min-w-[280px]">
                    <select
                        value={anoLetivoAtivo?.id || ''}
                        onChange={(e) => setAnoLetivoAtivo(anosLetivos.find(a => a.id === Number(e.target.value)) || null)}
                        className="appearance-none w-full h-11 pl-4 pr-10 rounded-xl text-sm font-medium border shadow-sm cursor-pointer"
                        style={{ backgroundColor: bgInactive, color: textPrimary, borderColor: borderInactive }}
                    >
                        {anosLetivos.map(ano => (
                            <option key={ano.id} value={ano.id}>
                                {ano.nome} - {ano.status}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 pointer-events-none" style={{ color: textSecondary }} />
                </div>
            </div>

            {/* Aviso se ano fechado */}
            {anoLetivoAtivo?.status === 'FECHADO' && (
                <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: `${corPrimaria}10`, borderColor: `${corPrimaria}30` }}>
                    <Lock className="w-4 h-4" style={{ color: corPrimaria }} />
                    <p className="text-sm" style={{ color: textPrimary }}>
                        Ano letivo <b>{anoLetivoAtivo.nome}</b> está fechado. Modo apenas para consulta.
                    </p>
                </div>
            )}

            {/* Tabs */}
            <div className="w-full">
                <div className="flex gap-2 p-0 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        const isFechado = anoLetivoAtivo?.status === 'FECHADO'
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                disabled={isFechado &&!['turmas'].includes(tab.id)} // 👈 só consulta em turmas
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: isActive? bgActive : bgInactive,
                                    color: isActive? corPrimaria : textSecondary,
                                    borderColor: isActive? borderActive : borderInactive
                                }}
                            >
                                <Icon className="w-4 h-4" style={{ color: isActive? corPrimaria : textSecondary }} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
                <div className="h-0.5 w-full mt-2 rounded-full" style={{ backgroundColor: lineColor }} />
            </div>

            {/* Conteúdo da Tab - PASSANDO A PROP */}
            <div className="rounded-2xl p-0">
                {anoLetivoAtivo && (
                    <>
                        {activeTab === 'turmas' && <div>Conteúdo de Turmas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                        {activeTab === 'cursos' && <div>Conteúdo de Cursos - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                        {activeTab === 'salas' && <div>Conteúdo de Salas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                        {activeTab === 'professores' && <div>Conteúdo de Professores - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                        {activeTab === 'disciplinas' && <div>Conteúdo de Disciplinas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                        {activeTab === 'horarios' && <div>Conteúdo de Horários - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                    </>
                )}
            </div>

            <style>{`
             .scrollbar-hide::-webkit-scrollbar { display: none; }
             .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
