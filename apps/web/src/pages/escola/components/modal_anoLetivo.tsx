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
    const isEdit =!!ano

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
    const inputClass = "w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
    const labelClass = "text-xs sm:text-right sm:justify-self-end text-gray-300 flex items-center gap-2"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()} className="w-full max-w-[680px] bg-[#0F172A]/90 backdrop-blur-2xl border-white/10 rounded-2xl flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-5 pb-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{isEdit? "Editar Ano Letivo" : "Cadastrar Ano Letivo"}</h2>
                            <p className="text-sm mt-1 text-gray-400">{isEdit? "Atualizar período letivo" : "Definir novo período escolar"}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="grid gap-5 py-4 px-5 overflow-y-auto flex-1 min-h-0">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Calendar className="w-4 h-4" />Nome do Ano *</label>
                                <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="Ex: 2026/2027" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><CalendarDays className="w-4 h-4" />Data Início *</label>
                                <input type="date" value={form.data_inicio} onChange={e => handleChange('data_inicio', e.target.value)} className={`${inputClass} sm:col-span-3`} required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><CalendarDays className="w-4 h-4" />Data Fim *</label>
                                <input type="date" value={form.data_fim} onChange={e => handleChange('data_fim', e.target.value)} className={`${inputClass} sm:col-span-3`} required />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 flex-col sm:flex-row gap-2 shrink-0 bg-[#0F172A]/90">
                        <button type="button" onClick={onClose} className="w-full sm:flex-1 px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border-red-500/20 text-red-400 transition order-2 sm:order-1">Cancelar</button>
                        <button type="submit" disabled={saving} className="w-full sm:flex-1 h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-white flex items-center justify-center gap-2 disabled:opacity-50 transition order-1 sm:order-2">
                            {saving? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving? "Salvando..." : isEdit? "Salvar" : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
