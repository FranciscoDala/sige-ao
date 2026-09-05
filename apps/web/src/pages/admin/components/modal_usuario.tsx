import { useState, useEffect, FormEvent, MouseEvent } from 'react'
import { X, Loader2, ShieldCheck, User, Mail, Lock, Building } from 'lucide-react'
import { toast } from 'sonner'
import { UsuarioMinisterio } from '../../types/usuario'

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: FormData, id?: string) => Promise<void>
    usuario: UsuarioMinisterio | null // vamos ignorar a edição
    saving: boolean
}

const PERFIS_MINISTERIO = [
    { value: 'super_admin', label: 'Super Administrador' },
    { value: 'admin', label: 'Administrador' },
    { value: 'suporte', label: 'Suporte' },
]

const DEPARTAMENTOS = [
    "Gabinete do Ministro", "Direção Nacional de Ensino Geral", "Direção Nacional de Ensino Superior",
    "Direção Nacional de Formação de Professores", "Direção de TIC", "Direção de Recursos Humanos",
    "Direção de Inspeção", "Gabinete Jurídico", "Outro"
]

export default function UsuarioModal({ open, onClose, onSave, usuario, saving }: Props) {
    const [form, setForm] = useState({
        nome: "", email: "", senha: "", perfil: "admin" as UsuarioMinisterio['perfil'], departamento: ""
    })
    const [dropdownPerfil, setDropdownPerfil] = useState(false)
    const [dropdownDepto, setDropdownDepto] = useState(false)

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
        if (open) { // sempre limpa ao abrir. Não tem edição
            setForm({ nome: "", email: "", senha: "", perfil: "admin", departamento: "" })
        }
    }, [open])

    if (!open) return null

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome é obrigatório"); return }
        if (!form.email) { toast.error("O email é obrigatório"); return }
        if (!form.senha || form.senha.length < 6) { toast.error("A senha deve ter no mínimo 6 caracteres"); return }
        if (!form.perfil) { toast.error("Selecione um perfil"); return }

        const formData = new FormData()
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        formData.append("tipo", "ministerio") // 👈 GARANTE QUE É DO MINISTERIO
        formData.append("ativo", "true")

        onSave(formData)
    }

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({...prev, [field]: value }))
    }

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    const inputClass = "w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
    const labelClass = "text-xs sm:text-right sm:justify-self-end text-gray-300 flex items-center gap-2"

    const CustomSelect = ({ value, onSelect, options, placeholder, isOpen, setIsOpen }: any) => (
        <div className="relative sm:col-span-3">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200`}
            >
                <span className="truncate">{options.find((o: any) => o.value === value)?.label || placeholder}</span>
                <ShieldCheck className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-[#1E293B]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-48 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {options.map((op: any) => (
                            <button
                                key={op.value}
                                type="button"
                                onClick={() => { onSelect(op.value); setIsOpen(false) }}
                                className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${value === op.value? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold' : 'text-gray-300 hover:text-white'}`}
                            >
                                <span>{op.label}</span>
                                {value === op.value && <div className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6]"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    const CustomSelectString = ({ value, onSelect, options, placeholder, isOpen, setIsOpen }: any) => (
        <div className="relative sm:col-span-3">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200`}
            >
                <span className="truncate">{value || placeholder}</span>
                <Building className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-20 w-full mt-2 bg-[#1E293B]/95 backdrop-blur-2xl border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-48 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {options.map((op: string) => (
                            <button key={op} type="button" onClick={() => { onSelect(op); setIsOpen(false) }} className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${value === op? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold' : 'text-gray-300 hover:text-white'}`}>
                                <span>{op}</span>
                                {value === op && <div className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6]"></div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div onClick={handleOverlayClick} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()} className="w-full max-w-[680px] bg-[#0F172A]/90 backdrop-blur-2xl border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="p-5 pb-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">Cadastrar Usuário Ministério</h2>
                            <p className="text-sm mt-1 text-gray-400">Preencha os dados para dar acesso ao painel</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="grid gap-5 py-4 px-5 overflow-y-auto flex-1 min-h-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                        {/* DADOS PESSOAIS */}
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
                                <label className={labelClass}><Lock className="w-4 h-4" />Senha *</label>
                                <input type="password" value={form.senha} onChange={e => handleChange('senha', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="Mínimo 6 caracteres" required />
                            </div>
                        </div>

                        {/* ACESSO */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><ShieldCheck className="w-4 h-4" />Perfil *</label>
                                <CustomSelect
                                    value={form.perfil}
                                    onSelect={(val: string) => handleChange('perfil', val)}
                                    options={PERFIS_MINISTERIO}
                                    placeholder="Selecione o Perfil"
                                    isOpen={dropdownPerfil}
                                    setIsOpen={setDropdownPerfil}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Building className="w-4 h-4" />Departamento</label>
                                <CustomSelectString
                                    value={form.departamento}
                                    onSelect={(val: string) => handleChange('departamento', val)}
                                    options={DEPARTAMENTOS}
                                    placeholder="Selecione o Departamento"
                                    isOpen={dropdownDepto}
                                    setIsOpen={setDropdownDepto}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/10 flex-col sm:flex-row gap-2 shrink-0 bg-[#0F172A]/90">
                        <button type="button" onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 text-red-400 transition">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-white flex items-center justify-center gap-2 disabled:opacity-50 transition">
                            {saving? <Loader2 className="w-4 h-4 animate-spin" /> : null}{saving? "Salvando..." : "Cadastrar Usuário"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
