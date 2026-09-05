import { useState, useRef, useEffect, FormEvent, MouseEvent } from 'react'
import { X, Loader2, User, Mail, Lock, Phone, ToggleLeft, ToggleRight, Eye, EyeOff, Building2, Shield, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { UsuarioMinisterio } from '../../types/usuario'

interface Escola {
    id: string
    nome: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: { nome: string, email: string, senha?: string, telefone?: string, ativo?: boolean, nivel: string, escola_id?: string }) => Promise<void>
    saving: boolean
    usuario: UsuarioMinisterio | null
    escolas: Escola[]
}

const NIVEIS_USUARIO = [
    { value: "MINISTERIO", label: "Ministério - Admin Geral" },
    { value: "DIRETOR", label: "Diretor - Gerente da Escola" },
]

export default function UsuarioModal({ open, onClose, onSave, saving, usuario, escolas }: Props) {
    const [form, setForm] = useState({
        nome: "", email: "", senha: "", telefone: "", ativo: true,
        nivel: "DIRETOR",
        escola_id: ""
    })
    const [showPassword, setShowPassword] = useState(false)

    const [dropdownNivel, setDropdownNivel] = useState(false)
    const [dropdownEscola, setDropdownEscola] = useState(false)
    const dropdownNivelRef = useRef<HTMLDivElement>(null)
    const dropdownEscolaRef = useRef<HTMLDivElement>(null)

    const isEdit =!!usuario
    const mostrarSelectEscola = form.nivel === "DIRETOR"

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (dropdownNivelRef.current &&!dropdownNivelRef.current.contains(event.target as Node)) setDropdownNivel(false)
            if (dropdownEscolaRef.current &&!dropdownEscolaRef.current.contains(event.target as Node)) setDropdownEscola(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!open) return
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [open])

    useEffect(() => {
        if (open) {
            if (isEdit && usuario) {
                setForm({
                    nome: usuario.nome,
                    email: usuario.email,
                    senha: "",
                    telefone: usuario.telefone || "",
                    ativo: usuario.ativo,
                    nivel: usuario.nivel || "DIRETOR",
                    escola_id: usuario.escola_id || ""
                })
            } else {
                setForm({ nome: "", email: "", senha: "", telefone: "", ativo: true, nivel: "DIRETOR", escola_id: "" })
            }
            setShowPassword(false)
        }
    }, [open, usuario, isEdit])

    if (!open) return null

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome é obrigatório"); return }
        if (!form.email) { toast.error("O email é obrigatório"); return }
        if (!isEdit && (!form.senha || form.senha.length < 6)) { toast.error("A senha deve ter no mínimo 6 caracteres"); return }
        if (mostrarSelectEscola &&!form.escola_id) { toast.error("Selecione a escola do Diretor"); return }

        const payload: any = {...form }
        if (isEdit &&!payload.senha) delete payload.senha
        if (form.nivel === "MINISTERIO") delete payload.escola_id

        onSave(payload)
    }

    const handleChange = (field: string, value: string | boolean) => {
        if (field === 'nivel' && value === "MINISTERIO") {
            setForm(prev => ({...prev, [field]: value, escola_id: "" }))
        } else {
            setForm(prev => ({...prev, [field]: value }))
        }
    }

    const inputClass = "w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
    const labelClass = "text-xs sm:text-right sm:justify-self-end text-gray-300 flex items-center gap-2"

    const CustomSelect = ({
        value, onSelect, options, placeholder, disabled = false, isOpen, setIsOpen, refDiv, isObject = true
    }: any) => (
        <div ref={refDiv} className="relative sm:col-span-3">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <span className="truncate">
                    {isObject? options.find((o: any) => o.value === value)?.label || placeholder : value || placeholder}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#1E293B]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-48 overflow-y-auto overflow-x-hidden py-1">
                        {options.length === 0 && <p className="px-4 py-3 text-gray-400 text-sm">Nenhuma opção</p>}
                        {options.map((op: any) => {
                            const optionValue = isObject? op.value : op
                            const optionLabel = isObject? op.label : op
                            return (
                                <button
                                    key={optionValue}
                                    type="button"
                                    onClick={() => { onSelect(optionValue); setIsOpen(false) }}
                                    className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${value === optionValue? 'bg-[#3B82F6]/20 text-[#3B82F6] font-semibold' : 'text-gray-300 hover:text-white'}`}
                                >
                                    <span>{optionLabel}</span>
                                    {value === optionValue && <div className="ml-auto w-2 h-2 rounded-full bg-[#3B82F6]"></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            {/* 👇 ADICIONEI 'flex' aqui e tirei overflow-hidden */}
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="w-full max-w-[680px] bg-[#0F172A]/90 backdrop-blur-2xl border-white/10 rounded-2xl flex flex-col max-h-[90vh] shadow-2xl"
            >
                {/* HEADER */}
                <div className="p-5 pb-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">{isEdit? "Editar Usuário" : "Cadastrar Usuário"}</h2>
                            <p className="text-sm mt-1 text-gray-400">{isEdit? "Atualizar os dados do usuário" : "Adicionar usuário para gerenciar"}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* BODY COM SCROLL */}
                    <div className="grid gap-5 py-4 px-5 overflow-y-auto flex-1 min-h-0">

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
                                <label className={labelClass}><Shield className="w-4 h-4" />Nível de Acesso *</label>
                                <CustomSelect
                                    refDiv={dropdownNivelRef}
                                    value={form.nivel}
                                    onSelect={(val: string) => handleChange('nivel', val)}
                                    options={NIVEIS_USUARIO}
                                    placeholder="Selecione o Nível"
                                    isOpen={dropdownNivel}
                                    setIsOpen={setDropdownNivel}
                                    isObject={true}
                                />
                            </div>

                            {mostrarSelectEscola && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4 animate-in fade-in-0">
                                    <label className={labelClass}><Building2 className="w-4 h-4" />Escola *</label>
                                    <CustomSelect
                                        refDiv={dropdownEscolaRef}
                                        value={form.escola_id}
                                        onSelect={(val: string) => handleChange('escola_id', val)}
                                        options={escolas.map(e => ({ value: e.id, label: e.nome }))}
                                        placeholder="Selecione a Escola"
                                        isOpen={dropdownEscola}
                                        setIsOpen={setDropdownEscola}
                                        isObject={true}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Lock className="w-4 h-4" />Senha {isEdit? '' : '*'}</label>
                                <div className="relative sm:col-span-3">
                                    <input
                                        type={showPassword? "text" : "password"}
                                        value={form.senha}
                                        onChange={e => handleChange('senha', e.target.value)}
                                        className={`${inputClass} pr-12`}
                                        placeholder={isEdit? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition"
                                    >
                                        {showPassword? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 sm:items-center gap-1 sm:gap-4">
                                <label className={labelClass}><Phone className="w-4 h-4" />Telefone</label>
                                <input type="tel" value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} className={`${inputClass} sm:col-span-3`} placeholder="+244 9xx xxx" />
                            </div>

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

                    {/* FOOTER FIXO - AGORA APARECE */}
                    <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 shrink-0 bg-[#0F172A]/95 backdrop-blur-xl">
                        <button type="button" onClick={onClose} className="w-full sm:flex-1 px-6 h-11 font-semibold rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-500/20 text-red-400 transition order-2 sm:order-1">
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving} className="w-full sm:flex-1 h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:shadow-lg hover:shadow-[#3B82F6]/30 text-white flex items-center justify-center gap-2 disabled:opacity-50 transition order-1 sm:order-2">
                            {saving? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {saving? "Salvando..." : isEdit? "Salvar" : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
