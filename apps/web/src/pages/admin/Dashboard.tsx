import { useState, useEffect, useRef, FormEvent } from 'react'
import axios from 'axios'
import {
    Building2, Users, MapPin, TrendingUp, Eye, Edit, Trash2, Plus,
    ChevronDown, Loader2, School, Phone, Mail, MapPinIcon, X, Upload, Palette, Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL

// MUDA AQUI: pega do localStorage igual o authService faz
const getToken = (): string | null => {
    return localStorage.getItem('access_token') // nome que vem do backend
};

// AXIOS COM INTERCEPTOR - JÁ MANDA TOKEN EM TUDO
const api = axios.create({
    baseURL: API_URL
})

api.interceptors.request.use((config) => {
    const token = getToken() // trocou
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})




interface Escola {
    id: string
    nome: string
    sigla?: string
    provincia?: string
    municipio?: string
    telefone?: string
    email?: string
    logo_url?: string
    ativo: boolean
    cor_primaria: string
    cor_secundaria: string
    tema: string
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <p className="text-sm text-gray-400">{title}</p>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <p className="text-4xl font-bold text-white mb-1">{value}</p>
        <div className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>+12% este mês</span>
        </div>
    </div>
)

const EscolaCard = ({ escola, onEdit, onDelete }: { escola: Escola, onEdit: () => void, onDelete: () => void }) => (
    <div className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-[#3B82F6]/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center flex-shrink-0">
                    {escola.logo_url? <img src={escola.logo_url} alt={escola.nome} className="w-full h-full object-cover rounded-xl" /> : <School className="w-6 h-6 text-white" />}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{escola.nome}</h3>
                    <p className="text-xs text-gray-400">{escola.sigla || `ID: ${escola.id}`}</p>
                </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${escola.ativo? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {escola.ativo? 'Ativa' : 'Inativa'}
            </span>
        </div>

        <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPinIcon className="w-4 h-4 text-[#3B82F6]" />
                <span>{escola.provincia || 'N/A'} - {escola.municipio || 'N/A'}</span>
            </div>
            {escola.email && <div className="flex items-center gap-2 text-sm text-gray-300"><Mail className="w-4 h-4 text-[#3B82F6]" /><span className="truncate">{escola.email}</span></div>}
            {escola.telefone && <div className="flex items-center gap-2 text-sm text-gray-300"><Phone className="w-4 h-4 text-[#3B82F6]" /><span>{escola.telefone}</span></div>}
        </div>

        <div className="flex gap-2 pt-3 border-t border-white/10">
            <button className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-[#3B82F6]/20 rounded-lg text-sm transition"><Eye className="w-4 h-4" /> Ver</button>
            <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-[#8B5CF6]/20 rounded-lg text-sm transition"><Edit className="w-4 h-4" /> Editar</button>
            <button onClick={onDelete} className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
        </div>
    </div>
)

// MODAL GLASS AJUSTADA
const EscolaModal = ({ open, onClose, onSave, escola, saving }: any) => {
    const fileRef = useRef<HTMLInputElement>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", provincia: "", municipio: "", telefone: "", email: "",
        cor_primaria: "#3B82F6", cor_secundaria: "#8B5CF6", tema: "escuro"
    })

    useEffect(() => {
        if (escola) {
            setForm({
                nome: escola.nome, sigla: escola.sigla || "", provincia: escola.provincia || "", municipio: escola.municipio || "",
                telefone: escola.telefone || "", email: escola.email || "",
                cor_primaria: escola.cor_primaria, cor_secundaria: escola.cor_secundaria, tema: escola.tema
            })
            setLogoPreview(escola.logo_url || null)
        } else {
            setForm({ nome: "", sigla: "", provincia: "", municipio: "", telefone: "", email: "", cor_primaria: "#3B82F6", cor_secundaria: "#8B5CF6", tema: "escuro" })
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
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        if (fileRef.current?.files?.[0]) formData.append("logo", fileRef.current.files[0])
        onSave(formData, escola?.id)
    }

    const handleChange = (field: string, value: string) => setForm(prev => ({...prev, [field]: value }))
    const inputClass = "w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] transition"
    const labelClass = "text-sm font-semibold text-gray-300 mb-2 block"

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in-0">
            <div className="w-full max-w-2xl bg-[#0F172A]/80 backdrop-blur-2xl border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center"><School className="w-5 h-5 text-white" /></div>
                        <div><h2 className="text-xl font-bold text-white">{escola? "Editar Escola" : "Cadastrar Nova Escola"}</h2><p className="text-sm text-gray-400">{escola? "Altere os dados abaixo." : "Preencha os dados da nova escola"}</p></div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-[#3B82F6]" />Dados Gerais</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Nome da Escola *</label><input value={form.nome} onChange={e => handleChange('nome', e.target.value)} className={inputClass} placeholder="Escola Mutamba" required /></div>
                            <div><label className={labelClass}>Sigla</label><input value={form.sigla} onChange={e => handleChange('sigla', e.target.value)} className={inputClass} placeholder="EEM" /></div>
                            <div><label className={labelClass}>Email</label><input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={inputClass} placeholder="contato@escola.ao" /></div>
                            <div><label className={labelClass}>Telefone</label><input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} className={inputClass} placeholder="+244 923 000 000" /></div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-[#3B82F6]" />Localização</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><label className={labelClass}>Província</label><input value={form.provincia} onChange={e => handleChange('provincia', e.target.value)} className={inputClass} placeholder="Luanda" /></div>
                            <div><label className={labelClass}>Município</label><input value={form.municipio} onChange={e => handleChange('municipio', e.target.value)} className={inputClass} placeholder="Talatona" /></div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-[#3B82F6]" />Personalização</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div><label className={labelClass}>Cor Primária</label><input type="color" value={form.cor_primaria} onChange={e => handleChange('cor_primaria', e.target.value)} className="w-full h-11 rounded-xl bg-white/5 border-white/10 cursor-pointer" /></div>
                            <div><label className={labelClass}>Cor Secundária</label><input type="color" value={form.cor_secundaria} onChange={e => handleChange('cor_secundaria', e.target.value)} className="w-full h-11 rounded-xl bg-white/5 border border-white/10 cursor-pointer" /></div>
                            <div><label className={labelClass}>Tema</label>
                                <select value={form.tema} onChange={e => handleChange('tema', e.target.value)} className={inputClass}>
                                    <option value="escuro">Escuro</option><option value="claro">Claro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#3B82F6]" />Logo da Escola</p>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">{logoPreview? <img src={logoPreview} className="w-full h-full object-cover rounded-xl" /> : <Upload className="w-6 h-6 text-gray-500" />}</div>
                            <div className="flex-1"><input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" onChange={handleFileChange} />
                                <label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border-white/10 rounded-xl text-white/70 cursor-pointer hover:bg-white/10 text-sm font-semibold"><Upload className="w-4 h-4" /> Enviar Logo</label></div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 shrink-0">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 h-11 font-semibold rounded-xl bg-white/5 text-white hover:bg-white/10 transition">Cancelar</button>
                    <button type="submit" onClick={handleSubmit} disabled={saving} className="w-full sm:flex-1 h-11 font-bold rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#3B82F6]/30 transition disabled:opacity-50">
                        {saving? <Loader2 className="w-5 h-5 animate-spin" /> : null}{saving? "Salvando..." : escola? "Salvar Alterações" : "Criar Escola"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [filtroStatus, setFiltroStatus] = useState('todas')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [escolaEditando, setEscolaEditando] = useState<Escola | null>(null)
    const [saving, setSaving] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current &&!dropdownRef.current.contains(event.target as Node)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchEscolas = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (filtroStatus === 'ativa') params.ativo = true
            if (filtroStatus === 'inativa') params.ativo = false
            const res = await api.get<Escola[]>(`/escolas`, { params }) // 👈 AGORA USA 'api'
            setEscolas(res.data)
        } catch (err: any) {
            toast.error(`Erro ao carregar escolas: ${err.response?.data?.detail || err.message}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchEscolas() }, [filtroStatus])

    const handleSaveEscola = async (data: FormData, id?: string) => {
        setSaving(true)
        try {
            if (id) {
                await api.put(`/escolas/${id}`, data) // 👈 AGORA USA 'api'
                toast.success("Escola atualizada com sucesso!")
            } else {
                await api.post(`/escolas`, data) // 👈 AGORA USA 'api'
                toast.success("Escola criada com sucesso!")
            }
            setModalOpen(false)
            setEscolaEditando(null)
            fetchEscolas()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erro ao salvar escola")
        } finally {
            setSaving(false)
        }
    }

    const handleOpenCreate = () => { setEscolaEditando(null); setModalOpen(true) }
    const handleOpenEdit = (escola: Escola) => { setEscolaEditando(escola); setModalOpen(true) }
    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja desativar esta escola?")) {
            try {
                await api.delete(`/escolas/${id}`) // 👈 AGORA USA 'api'
                toast.success("Escola desativada")
                fetchEscolas()
            } catch { toast.error("Erro ao desativar") }
        }
    }

    const opcoesFiltro = [
        { value: 'todas', label: 'Todas as Escolas', icon: Building2 },
        { value: 'ativa', label: 'Apenas Ativas', icon: TrendingUp },
        { value: 'inativa', label: 'Apenas Inativas', icon: Trash2 },
    ]
    const opcaoSelecionada = opcoesFiltro.find(o => o.value === filtroStatus)

    return (
        <div className="space-y-6">
            <div><h2 className="text-3xl font-bold text-white">Painel Adminstrativo</h2><p className="text-gray-400">Gerencie todas as escolas cadastradas no SIGE</p></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total de Escolas" value={escolas.length} icon={Building2} color="bg-gradient-to-br from-[#3B82F6] to-[#2563EB]" />
                <StatCard title="Escolas Ativas" value={escolas.filter(e => e.ativo).length} icon={Users} color="bg-gradient-to-br from-[#10B981] to-[#059669]" />
                <StatCard title="Províncias" value={new Set(escolas.map(e => e.provincia)).size} icon={MapPin} color="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div ref={dropdownRef} className="relative w-full sm:w-1/2">
                    <label className="text-sm text-gray-400 mb-2 block">Filtrar por Status</label>
                    <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full h-12 px-4 bg-white/5 border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:border-white/20 transition">
                        <div className="flex items-center gap-3 truncate">{opcaoSelecionada && <opcaoSelecionada.icon className="w-5 h-5 text-[#3B82F6] flex-shrink-0" />}<span className="truncate">{opcaoSelecionada?.label}</span></div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-[#1E293B]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                            <div className="max-h-60 overflow-y-auto py-1">{opcoesFiltro.map(op => (
                                <button key={op.value} type="button" onClick={() => { setFiltroStatus(op.value); setDropdownOpen(false) }} className={`w-full text-left px-4 py-3 hover:bg-white/10 transition flex items-center gap-3 ${filtroStatus === op.value? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-white'}`}>
                                    <op.icon className="w-5 h-5 flex-shrink-0" /><span>{op.label}</span>
                                </button>
                            ))}</div>
                        </div>
                    )}
                </div>

                <div className="w-full sm:w-1/2 flex items-end">
                    <button onClick={handleOpenCreate} className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white px-5 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#3B82F6]/30 transition">
                        <Plus className="w-5 h-5" /> Nova Escola
                    </button>
                </div>
            </div>

            <div>
                <p className="font-bold text-white text-lg mb-4">Escolas Cadastradas <span className="text-sm font-normal text-gray-400 ml-2">({escolas.length} encontradas)</span></p>
                {loading? <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" /></div> :
                    escolas.length === 0? <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center"><School className="w-12 h-12 text-gray-500 mx-auto mb-3" /><p className="text-gray-400">Nenhuma escola encontrada com este filtro.</p></div> :
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {escolas.map((escola) => <EscolaCard key={escola.id} escola={escola} onEdit={() => handleOpenEdit(escola)} onDelete={() => handleDelete(escola.id)} />)}
                        </div>
                }
            </div>

            <EscolaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEscola} escola={escolaEditando} saving={saving} />
        </div>
    )
}
