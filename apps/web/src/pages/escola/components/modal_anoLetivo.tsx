import { useState, useEffect, FormEvent, MouseEvent } from 'react'
import { X, Loader2, Calendar, CalendarDays, Save } from 'lucide-react'
import { toast } from 'sonner'

type AnoLetivo = { id: number; nome: string; status: 'ATIVO' | 'FECHADO' | 'PLANEJAMENTO'; data_inicio: string; data_fim: string }

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: { nome: string, data_inicio: string, data_fim: string, status: string }) => Promise<void>
    saving: boolean
    ano: AnoLetivo | null // null = criar, obj = editar
}

export default function AnoLetivoModal({ open, onClose, onSave, saving, ano }: Props) {
    const [form, setForm] = useState({ nome: "", data_inicio: "", data_fim: "", status: "PLANEJAMENTO" })
    const [tema, setTema] = useState<any>(null)
    const isEdit = !!ano

    useEffect(() => {
        const t = localStorage.getItem('escola_tema')
        if (t) setTema(JSON.parse(t))
        const handleTemaUpdated = () => {
            const t2 = localStorage.getItem('escola_tema')
            if (t2) setTema(JSON.parse(t2))
        }
        window.addEventListener('escola-tema-updated', handleTemaUpdated)
        return () => window.removeEventListener('escola-tema-updated', handleTemaUpdated)
    }, [])

    const isClaro = tema?.tema === 'claro'
    const corPrimaria = tema?.cor_primaria || '#3B82F6'
    const corSecundaria = tema?.cor_secundaria || '#8B5CF6'
    const textPrimary = isClaro? '#1E293B' : 'white'
    const textSecondary = isClaro? '#64748B' : '#9CA3AF'
    const bgCard = isClaro? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
    const borderCard = isClaro? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'

    const getCardStyle = () => {
        const estilo = tema?.estilo_card || 'arredondado'
        if (isClaro) {
            const baseClaro = `bg-white border`
            switch (estilo) {
                case 'quadrado': return `${baseClaro} rounded-none`
                case 'minimalista': return `${baseClaro} rounded-lg border-0`
                case 'elevado': return `${baseClaro} rounded-2xl shadow-2xl`
                case 'borda_colorida': return `${baseClaro} rounded-2xl border-2`
                case 'glass': return `${baseClaro} rounded-2xl`
                default: return `${baseClaro} rounded-2xl`
            }
        } else {
            const baseEscuro = `bg-white/5 backdrop-blur-xl border`
            switch (estilo) {
                case 'quadrado': return `${baseEscuro} rounded-none`
                case 'minimalista': return `${baseEscuro} rounded-lg border-0`
                case 'elevado': return `${baseEscuro} rounded-2xl shadow-2xl shadow-black/20`
                case 'borda_colorida': return `${baseEscuro} rounded-2xl border-2`
                case 'glass': return `bg-white/10 backdrop-blur-2xl border rounded-2xl`
                default: return `${baseEscuro} rounded-2xl`
            }
        }
    }
    const cardClass = getCardStyle()

    useEffect(() => {
        if (!open) return
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [open, onClose])

    useEffect(() => {
        if (open) {
            if (isEdit && ano) {
                setForm({
                    nome: ano.nome,
                    data_inicio: ano.data_inicio,
                    data_fim: ano.data_fim,
                    status: ano.status
                })
            } else {
                const anoAtual = new Date().getFullYear()
                setForm({
                    nome: `${anoAtual}/${anoAtual + 1}`,
                    data_inicio: `${anoAtual}-09-01`,
                    data_fim: `${anoAtual + 1}-07-15`,
                    status: "PLANEJAMENTO"
                })
            }
        }
    }, [open, ano, isEdit])

    if (!open) return null

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome do ano é obrigatório"); return }
        if (!form.data_inicio) { toast.error("Data de início é obrigatória"); return }
        if (!form.data_fim) { toast.error("Data de fim é obrigatória"); return }
        if (new Date(form.data_fim) <= new Date(form.data_inicio)) { toast.error("Data de fim deve ser maior que data de início"); return }
        onSave(form)
    }

    const handleChange = (field: string, value: string) => setForm(prev => ({...prev, [field]: value }))

    // INPUT MENOR: h-11 -> h-10 px-4 -> px-3
    const inputClass = `w-full min-w-0 h-10 px-3 rounded-xl focus:outline-none focus:ring-2 transition appearance-none text-sm`
    const labelClass = "text-sm font-medium flex items-center gap-2"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            {/* LARGURA MENOR: max-w-[420px] -> [380px] */}
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className={`w-full max-w-[380px] ${cardClass} flex-col max-h-[90vh] overflow-hidden`}
                style={{ borderColor: borderCard }}
            >
                {/* HEADER MAIS COMPACTO: p-5 pb-3 -> p-4 pb-3 */}
                <div className="p-4 pb-3 border-b shrink-0" style={{ borderColor: borderCard }}>
                    <div className="flex items-center justify-between">
                        <div>
                            {/* TITULO MENOR: text-lg -> text-base */}
                            <h2 className="text-base font-bold" style={{ color: textPrimary }}>
                                {isEdit? "Editar Ano Letivo" : "Cadastrar Ano Letivo"}
                            </h2>
                            {/* SUBTITULO MENOR: text-sm -> text-xs */}
                            <p className="text-xs mt-1" style={{ color: textSecondary }}>
                                {isEdit? "Atualizar período letivo" : "Definir novo período escolar"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg transition hover:bg-black/10"
                        >
                            {/* ICONE MENOR: w-5 -> w-4 */}
                            <X className="w-4 h-4" style={{ color: textSecondary }} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* GRID MENOR: gap-4 py-4 px-5 -> gap-3 py-3 px-4 */}
                    <div className="grid gap-3 py-3 px-4 overflow-y-auto flex-1 min-h-0">
                        <div>
                            {/* LABEL MB MENOR: mb-2 -> mb-1.5 */}
                            <label className={`${labelClass} mb-1.5`} style={{ color: textPrimary }}>
                                {/* ICONE MENOR: w-4 -> w-3.5 */}
                                <Calendar className="w-3.5 h-3.5" style={{ color: corPrimaria }} />Nome do Ano *
                            </label>
                            <input
                                value={form.nome}
                                onChange={e => handleChange('nome', e.target.value)}
                                className={inputClass}
                                style={{ background: bgCard, border: `1px solid ${borderCard}`, color: textPrimary }}
                                placeholder="Ex: 2026/2027"
                                required
                            />
                        </div>
                        <div>
                            <label className={`${labelClass} mb-1.5`} style={{ color: textPrimary }}>
                                <CalendarDays className="w-3.5 h-3.5" style={{ color: corPrimaria }} />Data Início *
                            </label>
                            <input
                                type="date"
                                value={form.data_inicio}
                                onChange={e => handleChange('data_inicio', e.target.value)}
                                className={inputClass}
                                style={{ background: bgCard, border: `1px solid ${borderCard}`, color: textPrimary, colorScheme: isClaro? 'light' : 'dark' }}
                                required
                            />
                        </div>
                        <div>
                            <label className={`${labelClass} mb-1.5`} style={{ color: textPrimary }}>
                                <CalendarDays className="w-3.5 h-3.5" style={{ color: corPrimaria }} />Data Fim *
                            </label>
                            <input
                                type="date"
                                value={form.data_fim}
                                onChange={e => handleChange('data_fim', e.target.value)}
                                className={inputClass}
                                style={{ background: bgCard, border: `1px solid ${borderCard}`, color: textPrimary, colorScheme: isClaro? 'light' : 'dark' }}
                                required
                            />
                        </div>
                    </div>

                    {/* FOOTER MAIS COMPACTO: p-4 gap-3 -> p-3 gap-2 */}
                    <div
                        className="p-3 border-t flex-col gap-2 shrink-0"
                        style={{ borderColor: borderCard, background: isClaro? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.2)' }}
                    >
                        {/* BOTAO MENOR: h-11 -> h-10 */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full h-10 font-semibold rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-50 transition text-sm"
                            style={{
                                background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                                borderRadius: tema?.estilo_card === 'quadrado'? '0.5rem' : tema?.estilo_card === 'minimalista'? '0.25rem' : '0.75rem'
                            }}
                        >
                            {saving? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {saving? "Salvando..." : isEdit? "Salvar" : "Cadastrar"}
                        </button>
                        {/* BOTAO CANCELAR MENOR: h-11 -> h-10 px-6 -> px-4 */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full px-4 h-10 font-semibold rounded-xl border transition text-sm"
                            style={{
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#EF4444'
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
