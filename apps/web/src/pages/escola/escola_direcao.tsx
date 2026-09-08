import React, { useState, useEffect } from 'react'
import { Building, Users, DoorOpen, BookOpen, Calendar, GraduationCap, Laptop, Loader2, Lock, Plus } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import AnoLetivoModal from './components/modal_anoLetivo'

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

const formatNivel = (nivel: string) => {
    return nivel
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
}

export default function EscolaDirecaoPage() {
    const [nivel, setNivel] = useState<NivelEnsino>('PRIMARIO')
    const [tabs, setTabs] = useState<Tab[]>(TABS_POR_NIVEL.PRIMARIO)
    const [activeTab, setActiveTab] = useState('turmas')
    const [loading, setLoading] = useState(true)
    const [corPrimariaHex, setCorPrimariaHex] = useState('#0056b3')
    const [isClaro, setIsClaro] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [savingAno, setSavingAno] = useState(false)
    const [modalAnoOpen, setModalAnoOpen] = useState(false)

    const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
    const [anoLetivoAtivo, setAnoLetivoAtivo] = useState<AnoLetivo | null>(null)

    const STORAGE_KEY_TAB = 'direcao_active_tab'

    const carregarDados = async () => {
        setLoading(true)
        setErro(null)
        try {
            const resEscola = await api.get('/escolas/me')
            const resAnos = await api.get('/anos-letivos')

            const nivelEscola = resEscola.data.nivel_ensino as NivelEnsino
            setNivel(nivelEscola)
            setCorPrimariaHex(resEscola.data.cor_primaria || '#0056b3')
            setIsClaro(resEscola.data.tema === 'claro')

            const tabsDoNivel = TABS_POR_NIVEL[nivelEscola] || TABS_POR_NIVEL.PRIMARIO
            setTabs(tabsDoNivel)
            setAnosLetivos(resAnos.data)

            const anoAtivo = resAnos.data.find((a: AnoLetivo) => a.status === 'ATIVO')
            setAnoLetivoAtivo(anoAtivo || resAnos.data[0] || null)

            const savedTab = localStorage.getItem(STORAGE_KEY_TAB)
            const isValidTab = tabsDoNivel.some(t => t.id === savedTab)
            setActiveTab(isValidTab? savedTab! : tabsDoNivel[0].id)

        } catch (e: any) {
            console.error("Erro ao buscar dados iniciais", e)
            if (e.response?.status === 401) {
                setErro("Token expirado. Faça login novamente.")
            } else {
                setErro(e.response?.data?.detail || "Erro ao carregar dados")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { carregarDados() }, [])

    const handleSalvarAno = async (data: any) => {
        setSavingAno(true)
        try {
            await api.post('/anos-letivos', data)
            toast.success("Ano letivo criado com sucesso!")
            setModalAnoOpen(false)
            await carregarDados()
        } catch(e: any) {
            toast.error(e.response?.data?.detail || "Erro ao criar ano")
        } finally {
            setSavingAno(false)
        }
    }

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY_TAB, activeTab)
        }
    }, [activeTab, loading])

    const corPrimaria = corPrimariaHex
    const textPrimary = isClaro? '#1E293B' : 'white'
    const textSecondary = isClaro? '#64748B' : '#9CA3AF'
    const bgCard = isClaro? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
    const borderCard = isClaro? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
    const bgActive = `${corPrimaria}20`
    const borderActive = `${corPrimaria}4D`
    const lineColor = `${corPrimaria}26`

    // LOADER MENOR
    if (loading) return <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin" style={{ color: corPrimaria }} /></div>
    if(erro) return <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{erro}</div>

    return (
        <>
            {/* ESPAÇO MENOR: space-y-6 -> 4 */}
            <div className="space-y-4">
                {/* HEADER MAIS COMPACTO: gap-4 -> gap-3 */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {/* ICONE MENOR: w-7 -> w-6 */}
                        <Building className="w-6 h-6" style={{ color: corPrimaria }} />
                        <div>
                            {/* TITULO MENOR: text-2xl -> text-xl */}
                            <h1 className="text-xl font-bold" style={{ color: textPrimary }}>Direção Escolar</h1>
                            {/* TEXTO MENOR: text-sm -> text-xs */}
                            <p className="text-xs" style={{ color: textSecondary }}>
                                Ensino: {formatNivel(nivel)}
                                {anoLetivoAtivo && (
                                    <span> | {anoLetivoAtivo.nome} - {anoLetivoAtivo.status}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* BOTAO MENOR: h-11 -> h-10 px-5 -> px-4 */}
                    <button
                        onClick={() => setModalAnoOpen(true)}
                        className="w-full lg:w-auto h-10 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 text-white hover:scale-[1.02] transition text-sm"
                        style={{ backgroundColor: corPrimaria }}
                    >
                        <Plus className="w-3.5 h-3.5"/> Novo Ano
                    </button>
                </div>

                {/* ALERTA MENOR: p-3 -> p-2.5 */}
                {anoLetivoAtivo?.status === 'FECHADO' && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl border" style={{ backgroundColor: `${corPrimaria}10`, borderColor: `${corPrimaria}30` }}>
                        <Lock className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
                        <p className="text-xs" style={{ color: textPrimary }}>Ano letivo <b>{anoLetivoAtivo.nome}</b> está fechado. Modo apenas para consulta.</p>
                    </div>
                )}

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
                                    disabled={isFechado &&!['turmas'].includes(tab.id)}
                                    // TAB MENOR: px-4 py-2.5 -> px-3 py-2
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 border disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: isActive? bgActive : bgCard,
                                        color: isActive? corPrimaria : textSecondary,
                                        borderColor: isActive? borderActive : borderCard
                                    }}
                                >
                                    {/* ICONE MENOR: w-4 -> w-3.5 */}
                                    <Icon className="w-3.5 h-3.5" style={{ color: isActive? corPrimaria : textSecondary }} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                    <div className="h-0.5 w-full mt-2 rounded-full" style={{ backgroundColor: lineColor }} />
                </div>

                <div className="rounded-2xl p-0">
                    {anoLetivoAtivo && (
                        <>
                            {activeTab === 'turmas' && <div className="text-sm">Conteúdo de Turmas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'cursos' && <div className="text-sm">Conteúdo de Cursos - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'salas' && <div className="text-sm">Conteúdo de Salas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'professores' && <div className="text-sm">Conteúdo de Professores - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'disciplinas' && <div className="text-sm">Conteúdo de Disciplinas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'horarios' && <div className="text-sm">Conteúdo de Horários - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                        </>
                    )}
                </div>

                <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            </div>

            <AnoLetivoModal
                open={modalAnoOpen}
                onClose={() => setModalAnoOpen(false)}
                onSave={handleSalvarAno}
                saving={savingAno}
                ano={null}
            />
        </>
    )
}
