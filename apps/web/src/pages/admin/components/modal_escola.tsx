import { useState, useRef, useEffect, FormEvent } from 'react'
import { X, Upload, Loader2, School, Building2, Image as ImageIcon, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export interface Escola { // 👈 EXPORTA
    id: string
    nome: string
    sigla?: string | null
    provincia?: string | null
    municipio?: string | null
    telefone?: string | null
    email?: string | null
    logo_url?: string | null
    ativo: boolean
    cor_primaria: string
    cor_secundaria: string
    tema: string
}







// MODAL COM LAYOUT LABEL ESQUERDA
export default function EscolaModal({ open, onClose, onSave, escola, saving }: { open: boolean, onClose: () => void, onSave: (data: FormData, id?: string) => Promise<void>, escola: Escola | null, saving: boolean }) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [form, setForm] = useState({ nome: "", sigla: "", provincia: "", municipio: "" })

    useEffect(() => {
        if (escola) {
            setForm({ nome: escola.nome, sigla: escola.sigla || "", provincia: escola.provincia || "", municipio: escola.municipio || "" })
            setLogoPreview(escola.logo_url || null)
        } else {
            setForm({ nome: "", sigla: "", provincia: "", municipio: "" })
            setLogoPreview(null)
        }
    }, [escola, open])

    useEffect(() => {
        if (!open) return
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    if (!open) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) { const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result as string); reader.readAsDataURL(file) }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!form.nome) { toast.error("O nome da escola é obrigatório"); return }
        const formData = new FormData()
        if(!escola) formData.append("id", `ESC${Date.now().toString().slice(-3)}`) // Gera ID automático se for criar
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        formData.append("cor_primaria", "#3B82F6")
        formData.append("cor_secundaria", "#8B5CF6")
        formData.append("tema", "escuro")
        if (fileRef.current?.files?.[0]) formData.append("logo", fileRef.current.files[0])
        onSave(formData, escola?.id)
    }

    const handleChange = (field: string, value: string) => setForm(prev => ({...prev, [field]: value }))
    const inputClass = "w-full h-11 px-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] transition"
    const labelClass = "text-sm font-semibold text-gray-300 flex items-center"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in-0">
            <div className="w-full max-w-2xl bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center"><School className="w-5 h-5 text-white" /></div>
                        <div><h2 className="text-xl font-bold text-white">{escola? "Editar Escola" : "Cadastrar Escola"}</h2><p className="text-sm text-gray-400">{escola? "Altere os dados abaixo" : "Preencha os dados da nova escola"}</p></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <section>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#3B82F6]" />Dados Gerais</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-[160px_1fr] gap-4 items-center"><label className={labelClass}>Nome da Escola *</label><input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={inputClass} placeholder="Escola Mutamba" required /></div>
                            <div className="grid grid-cols-[160px_1fr] gap-4 items-center"><label className={labelClass}>Sigla</label><input value={form.sigla} onChange={e => handleChange('sigla', e.target.value)} className={inputClass} placeholder="EEM" /></div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3B82F6]" />Localização</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-[160px_1fr] gap-4 items-center"><label className={labelClass}>Província</label><input value={form.provincia} onChange={e => handleChange('provincia', e.target.value)} className={inputClass} placeholder="Luanda" /></div>
                            <div className="grid grid-cols-[160px_1fr] gap-4 items-center"><label className={labelClass}>Município</label><input value={form.municipio} onChange={e => handleChange('municipio', e.target.value)} className={inputClass} placeholder="Talatona" /></div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#3B82F6]" />Logo</h3>
                        <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
                            <label className={labelClass}>Imagem</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">{logoPreview? <img src={logoPreview} className="w-full h-full object-cover rounded-xl" /> : <Upload className="w-6 h-6 text-gray-500" />}</div>
                                <div className="flex-1"><input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" onChange={handleFileChange} /><label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 text-sm font-semibold"><Upload className="w-4 h-4" /> Enviar Logo</label></div>
                            </div>
                        </div>
                    </section>
                </form>

                <div className="p-6 border-t border-white/10 flex gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="w-full px-6 h-11 font-semibold rounded-xl bg-white/5 hover:bg-white/10 transition">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} disabled={saving} className="w-full h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-[#3B82F6]/30 transition">
                        {saving? <Loader2 className="w-5 h-5 animate-spin" /> : null}{saving? "Salvando..." : escola? "Salvar Alterações" : "Criar Escola"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// DASHBOARD - SÓ A LÓGICA DE SALVAR E DELETAR
export function useEscolasLogic() {
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [escolaEditando, setEscolaEditando] = useState<Escola | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchEscolas = async () => {
        try {
            const res = await axios.get<Escola[]>(`${API_URL}/escolas`)
            setEscolas(res.data)
        } catch (err: any) {
            toast.error(`Erro ao carregar escolas: ${err.message}`)
        }
    }

    useEffect(() => { fetchEscolas() }, [])

    const handleSaveEscola = async (data: FormData, id?: string) => {
        setSaving(true)
        const token = localStorage.getItem('access_token') // 👈 CORRIGIDO AQUI
        const headers = { 'Authorization': `Bearer ${token}` }

        try {
            if (id) {
                await axios.put(`${API_URL}/escolas/${id}`, data, { headers })
                toast.success("Escola atualizada com sucesso!")
            } else {
                await axios.post(`${API_URL}/escolas`, data, { headers })
                toast.success("Escola criada com sucesso!")
            }
            setModalOpen(false); setEscolaEditando(null); fetchEscolas()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erro ao salvar escola")
        } finally { setSaving(false) }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja desativar esta escola?")) {
            const token = localStorage.getItem('access_token') // 👈 E CORRIGIDO AQUI
            try {
                await axios.delete(`${API_URL}/escolas/${id}`, { headers: { 'Authorization': `Bearer ${token}` }})
                toast.success("Escola desativada")
                fetchEscolas()
            } catch { toast.error("Erro ao desativar") }
        }
    }

    return { escolas, modalOpen, setModalOpen, escolaEditando, setEscolaEditando, saving, handleSaveEscola, handleDelete, fetchEscolas }
}
