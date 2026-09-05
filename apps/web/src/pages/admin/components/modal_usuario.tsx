import { useState, useEffect, FormEvent } from 'react'
import { X, Loader2, User, Mail, Lock, Phone, ToggleLeft, ToggleRight } from 'lucide-react' // 👈 ADD
import { toast } from 'sonner'
import { UsuarioMinisterio } from '../../types/usuario'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: { nome: string, email: string, senha?: string, telefone?: string, ativo?: boolean }) => Promise<void> // 👈 ADD ativo
    saving: boolean
    usuario: UsuarioMinisterio | null
}

export default function UsuarioModal({ open, onClose, onSave, saving, usuario }: Props) {
    const [form, setForm] = useState({
        nome: "", email: "", senha: "", telefone: "", ativo: true // 👈 ADD
    })

    const isEdit =!!usuario

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
            if (isEdit && usuario) {
                setForm({
                    nome: usuario.nome,
                    email: usuario.email,
                    senha: "", // 👈 senha vazia no edit
                    telefone: usuario.telefone || "",
                    ativo: usuario.ativo // 👈 CARREGA STATUS
                })
            } else {
                setForm({ nome: "", email: "", senha: "", telefone: "", ativo: true }) // 👈 default ativo
            }
        }
    }, [open, usuario, isEdit])

    if (!open) return null

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome é obrigatório"); return }
        if (!form.email) { toast.error("O email é obrigatório"); return }
        if (!isEdit && (!form.senha || form.senha.length < 6)) { toast.error("A senha deve ter no mínimo 6 caracteres"); return }

        const payload: any = {...form }
        if (isEdit &&!payload.senha) delete payload.senha // 👈 não envia senha vazia
        onSave(payload)
    }

    const handleChange = (field: string, value: string | boolean) => { // 👈 ACEITA BOOL
        setForm(prev => ({...prev, [field]: value }))
    }

    const inputClass = "w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
    const labelClass = "text-xs sm:text-right sm:justify-self-end text-gray-300 flex items-center gap-2"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="w-full max-w-[680px] bg-[#0F172A]/90 backdrop-blur-2xl border-white/10 rounded-2xl flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-5 pb-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{isEdit? "Editar Usuário" : "Cadastrar Usuário Ministério"}</h2>
                            <p className="text-sm mt-1 text-gray-400">{isEdit? "Atualize os dados do Super Administrador" : "Será criado como Super Administrador"}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="grid gap-5 py-4 px-5 overflow-y-auto flex-1 min-h-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><User className="w-4 h-4" />Nome Completo *</label>
                                <input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="Ex: Maria da Silva" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Mail className="w-4 h-4" />Email *</label>
                                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="nome@minedu.gov.ao" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Lock className="w-4 h-4" />Senha {isEdit? '' : '*'}</label>
                                <input type="password" value={form.senha} onChange={e => handleChange('senha', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder={isEdit? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Phone className="w-4 h-4" />Telefone</label>
                                <input type="tel" value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="+244 9xx xxx" />
                            </div>

                            {/* 👈 NOVO: TOGGLE DE ATIVO SOMENTE NO EDIT */}
                            {isEdit && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                    <label className={labelClass}>Status</label>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('ativo',!form.ativo)}
                                        className={`sm:col-span-3 w-full h-11 px-4 rounded-xl flex items-center justify-between transition border ${form.ativo? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                                    >
                                        <span className={`font-semibold ${form.ativo? 'text-green-400' : 'text-red-400'}`}>
                                            {form.ativo? 'Ativo' : 'Inativo'}
                                        </span>
                                        {form.ativo? <ToggleRight className="w-6 h-6 text-green-400" /> : <ToggleLeft className="w-6 h-6 text-red-400" />}
                                    </button>
                                </div>
                            )}

                        </div>

                    </div>

                    <div className="p-4 border-t border-white/10 flex gap-2 shrink-0 bg-[#0F172A]/90">
                        <button type="button" onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border-red-500/20 text-red-400 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-white flex items-center justify-center gap-2 disabled:opacity-50 transition">
                            {saving? <Loader2 className="w-4 h-4 animate-spin" /> : null}{saving? "Salvando..." : isEdit? "Salvar" : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
