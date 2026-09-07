import React, { useState, useEffect, useRef } from 'react'
import { Building, Users, DoorOpen, BookOpen, Calendar, GraduationCap, Laptop, Loader2, ChevronDown, Lock, Plus, Check } from 'lucide-react'
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
type Option = { value: string; label: string }

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
    const [corPrimariaHex, setCorPrimariaHex] = useState('#0056b3')
    const [isClaro, setIsClaro] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [savingAno, setSavingAno] = useState(false)
    const [modalAnoOpen, setModalAnoOpen] = useState(false)

    const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
    const [anoLetivoAtivo, setAnoLetivoAtivo] = useState<AnoLetivo | null>(null)

    const STORAGE_KEY_TAB = 'direcao_active_tab'
    const STORAGE_KEY_ANO = 'direcao_active_ano'

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

            const anoSalvoId = localStorage.getItem(STORAGE_KEY_ANO)
            const anoAtivo = resAnos.data.find((a: AnoLetivo) => a.status === 'ATIVO')
            const anoSelecionado = anoSalvoId ? resAnos.data.find((a: AnoLetivo) => a.id === Number(anoSalvoId)) : anoAtivo
            setAnoLetivoAtivo(anoSelecionado || anoAtivo || resAnos.data[0] || null)

            const savedTab = localStorage.getItem(STORAGE_KEY_TAB)
            const isValidTab = tabsDoNivel.some(t => t.id === savedTab)
            setActiveTab(isValidTab ? savedTab! : tabsDoNivel[0].id)

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

    const handleAtivarAno = async (id: number) => {
        if(!confirm("Tem certeza? O ano atual sera fechado.")) return
        try {
            await api.put(`/anos-letivos/${id}/ativar`)
            toast.success("Ano letivo ativado!")
            await carregarDados()
        } catch(e: any) {
            toast.error(e.response?.data?.detail || "Erro ao ativar ano")
        }
    }

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(STORAGE_KEY_TAB, activeTab)
            if (anoLetivoAtivo) localStorage.setItem(STORAGE_KEY_ANO, String(anoLetivoAtivo.id))
        }
    }, [activeTab, anoLetivoAtivo, loading])

    const corPrimaria = corPrimariaHex
    const corSecundaria = '#FFC107'
    const textPrimary = isClaro ? '#1E293B' : 'white'
    const textSecondary = isClaro ? '#64748B' : '#9CA3AF'
    const bgCard = isClaro ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
    const borderCard = isClaro ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
    const bgActive = `${corPrimaria}20`
    const borderActive = `${corPrimaria}4D`
    const lineColor = `${corPrimaria}26`

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" style={{ color: corPrimaria }} /></div>
    if(erro) return <div className="p-6 rounded-xl bg-red-50 text-red-700">{erro}</div>

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Building className="w-7 h-7" style={{ color: corPrimaria }} />
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Direção Escolar</h1>
                            <p style={{ color: textSecondary }}>Ensino: {nivel.replace('_', ' ')}</p>
                        </div>
                    </div>

                    {/* BTNS E SELECT COM FLEX-WRAP PRA NÃO GRUDAR NO MOBILE */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setModalAnoOpen(true)}
                            className="h-11 px-5 font-semibold rounded-xl flex items-center justify-center gap-2 text-white hover:scale-[1.02] transition"
                            style={{
                                background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                                borderRadius: '0.75rem'
                            }}
                        >
                            <Plus className="w-4 h-4"/> Novo Ano
                        </button>

                        <CustomSelectAno
                            value={anoLetivoAtivo?.id || ''}
                            onChange={(id) => setAnoLetivoAtivo(anosLetivos.find(a => a.id === Number(id)) || null)}
                            options={anosLetivos.map(a => ({ value: String(a.id), label: `${a.nome} - ${a.status}` }))}
                            cor={corPrimaria}
                            textColor={textPrimary}
                            isClaro={isClaro}
                            bg={bgCard}
                            border={borderCard}
                        />

                        {anoLetivoAtivo?.status !== 'ATIVO' && (
                            <button
                                onClick={() => handleAtivarAno(anoLetivoAtivo!.id)}
                                title="Ativar este ano"
                                className="h-11 px-4 rounded-xl transition hover:scale-[1.02]"
                                style={{ backgroundColor: bgActive }}
                            >
                                <Check className="w-5 h-5" style={{ color: corPrimaria }}/>
                            </button>
                        )}
                    </div>
                </div>

                {anoLetivoAtivo?.status === 'FECHADO' && (
                    <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: `${corPrimaria}10`, borderColor: `${corPrimaria}30` }}>
                        <Lock className="w-4 h-4" style={{ color: corPrimaria }} />
                        <p className="text-sm" style={{ color: textPrimary }}>Ano letivo <b>{anoLetivoAtivo.nome}</b> está fechado. Modo apenas para consulta.</p>
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
                                    disabled={isFechado && !['turmas'].includes(tab.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap flex-shrink-0 border disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: isActive ? bgActive : bgCard,
                                        color: isActive ? corPrimaria : textSecondary,
                                        borderColor: isActive ? borderActive : borderCard
                                    }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: isActive ? corPrimaria : textSecondary }} />
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
                            {activeTab === 'turmas' && <div>Conteúdo de Turmas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'cursos' && <div>Conteúdo de Cursos - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'salas' && <div>Conteúdo de Salas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'professores' && <div>Conteúdo de Professores - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'disciplinas' && <div>Conteúdo de Disciplinas - ano_letivo_id: {anoLetivoAtivo.id}</div>}
                            {activeTab === 'horarios' && <div>Conteúdo de Horários - ano_letivo_id: {anoLetivoAtivo.id}</div>}
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

// ===== CUSTOM SELECT PADRONIZADO IGUAL DA DEFINICOES =====
interface CustomSelectAnoProps {
    value: string | number;
    onChange: (value: string) => void;
    options: Option[];
    cor: string;
    textColor: string;
    isClaro: boolean;
    bg: string;
    border: string
}

const CustomSelectAno = ({ value, onChange, options, cor, textColor, isClaro, bg, border }: CustomSelectAnoProps) => {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = options.find(o => o.value === String(value))

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} className="relative min-w-[240px]">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full h-11 px-4 rounded-xl flex items-center justify-between text-left transition"
                style={{ color: textColor, background: bg, border: `1px solid ${border}` }}
            >
                <span className="truncate">{selected?.label || 'Selecione'}</span>
                <ChevronDown className={`w-5 h-5 transition flex-shrink-0 ${open ? 'rotate-180' : ''}`} style={{ color: textColor }} />
            </button>
            {open && (
                <div
                    className="absolute z-20 w-full mt-2 rounded-xl shadow-2xl overflow-hidden border"
                    style={{ backgroundColor: isClaro ? '#FFFFFF' : '#1A1A1A', borderColor: border }}
                >
                    <div className="max-h-60 overflow-y-auto">
                        {options.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false) }}
                                className="w-full text-left px-4 py-3 transition"
                                style={{
                                    color: value === opt.value ? cor : textColor,
                                    backgroundColor: value === opt.value ? `${cor}20` : 'transparent'
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
