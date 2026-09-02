import { useState, useEffect, useRef } from 'react' // <- 1. ADICIONADO useState
import { useNavigate } from 'react-router-dom' // <- 2. ADICIONADO
import { School, LogOut, Plus, Edit, Trash2, Loader2, ShieldCheck, Upload, X, Eye, Palette } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL
const REQUEST_TIMEOUT = 60000

interface Escola {
    id: number
    nome: string
    sigla: string | null
    id_curto: string
    provincia: string | null
    municipio: string | null
    logo_url: string | null
    cor_primaria: string
    cor_secundaria: string
    tema: string
}

export default function Dashboard() {
    const navigate = useNavigate() // <- 3. ADICIONADO
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editando, setEditando] = useState<Escola | null>(null)
    const [saving, setSaving] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        nome: "",
        sigla: "",
        provincia: "",
        municipio: "",
        cor_primaria: "#CF0921",
        cor_secundaria: "#FFD700",
        tema: "claro"
    })

    const token = localStorage.getItem('token')
    const nivel = localStorage.getItem('nivel')

    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => {
        if(!token) { // <- Proteção extra
            navigate('/')
            return
        }
        carregarEscolas()
    }, [token, navigate])

    const carregarEscolas = async () => {
        setLoading(true)
        try {
            const res = await axios.get<Escola[]>(`${API_URL}/escolas`, { headers, timeout: REQUEST_TIMEOUT })
            setEscolas(res.data)
        } catch (err: any) {
            toast.error(`Erro ao carregar escolas: ${err.response?.data?.detail || err.message}`)
            if (err.response?.status === 401) navigate('/') // <- 4. TROCA AQUI
        } finally {
            setLoading(false)
        }
    }

    function abrirModal(escola?: Escola) {
        if (escola) {
            setEditando(escola)
            setForm({
                nome: escola.nome,
                sigla: escola.sigla || "",
                provincia: escola.provincia || "",
                municipio: escola.municipio || "",
                cor_primaria: escola.cor_primaria,
                cor_secundaria: escola.cor_secundaria,
                tema: escola.tema
            })
        } else {
            setEditando(null)
            setForm({
                nome: "", sigla: "", provincia: "", municipio: "",
                cor_primaria: "#CF0921", cor_secundaria: "#FFD700", tema: "claro"
            })
        }
        setModalOpen(true)
    }

    const salvar = async () => {
        if (!form.nome) { toast.error("Nome da escola é obrigatório"); return }
        setSaving(true)

        const formData = new FormData()
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        if (fileRef.current?.files?.[0]) {
            formData.append("logo", fileRef.current.files[0])
        }

        try {
            if (editando) {
                await axios.put(`${API_URL}/escolas/${editando.id}`, formData, { headers: {...headers, "Content-Type": "multipart/form-data" } })
                toast.success("Escola atualizada com sucesso!")
            } else {
                await axios.post(`${API_URL}/escolas`, formData, { headers: {...headers, "Content-Type": "multipart/form-data" } })
                toast.success("Escola criada com sucesso!")
            }
            setModalOpen(false)
            carregarEscolas()
        } catch (err: AxiosError<{ detail: string }> | any) {
            toast.error(err.response?.data?.detail || "Erro ao salvar escola")
        } finally {
            setSaving(false)
        }
    }

    const deletar = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta escola?")) return
        try {
            await axios.delete(`${API_URL}/escolas/${id}`, { headers })
            toast.success("Escola excluída")
            carregarEscolas()
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erro ao excluir")
        }
    }

    const logout = () => {
        localStorage.clear()
        navigate('/') // <- 5. TROCA AQUI
    }

    const inputClass = "w-full px-4 py-3 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
    const labelClass = "text-sm text-white/80 mb-1 block"

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>
            <Toaster position="top-center" />

            {/* Header */}
            <header className="bg-black/40 backdrop-blur-xl border-b border-white/10">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#CF0921] to-[#FFD700] rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">SIGE-AO</h1>
                            <p className="text-xs text-white/60">Painel Administrativo</p>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white">
                        <LogOut className="w-4 h-4" /> Sair
                    </button>
                </div>
            </header>

            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Gestão de Escolas</h2>
                        {nivel === 'MINISTERIO' && (
                            <button onClick={() => abrirModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-bold rounded-xl hover:scale-105 transition">
                                <Plus className="w-4 h-4" /> Nova Escola
                            </button>
                        )}
                    </div>

                    {loading? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {escolas.map(escola => (
                                <div key={escola.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-[#FFD700]/50 transition">
                                    <div className="flex items-center gap-3 mb-3">
                                        {escola.logo_url?
                                            <img src={escola.logo_url} className="w-12 h-12 rounded-xl object-cover border-white/20" /> :
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                                <School className="w-6 h-6 text-white/50" />
                                            </div>
                                        }
                                        <div>
                                            <h3 className="font-bold text-white">{escola.nome}</h3>
                                            <p className="text-sm text-white/60">{escola.id_curto} • {escola.sigla}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/70 mb-3">{escola.municipio}, {escola.provincia}</p>

                                    <div className="flex gap-2 mb-4">
                                        <div title="Cor Primária" className="w-6 h-6 rounded border-white/20" style={{ background: escola.cor_primaria }} />
                                        <div title="Cor Secundária" className="w-6 h-6 rounded border-white/20" style={{ background: escola.cor_secundaria }} />
                                        <span className="text-xs text-white/50 flex items-center gap-1"><Palette className="w-3 h-3" />{escola.tema}</span>
                                    </div>

                                    {nivel === 'MINISTERIO' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => abrirModal(escola)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">
                                                <Edit className="w-4 h-4" /> Editar
                                            </button>
                                            <button onClick={() => deletar(escola.id)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm">
                                                <Trash2 className="w-4 h-4" /> Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1A1A1A] border border-white/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">{editando? "Editar" : "Nova"} Escola</h2>
                            <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-white/50" /></button>
                        </div>

                        <div className="grid gap-4">
                            <div><label className={labelClass}>Nome *</label><input value={form.nome} onChange={e => setForm({...form, nome: e.target.value })} className={inputClass} placeholder="EEM Joaquim Capango" /></div>

                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Sigla</label><input value={form.sigla} onChange={e => setForm({...form, sigla: e.target.value })} className={inputClass} placeholder="EEMJC" /></div>
                                <div><label className={labelClass}>Província</label><input value={form.provincia} onChange={e => setForm({...form, provincia: e.target.value })} className={inputClass} placeholder="Luanda" /></div>
                            </div>

                            <div><label className={labelClass}>Município</label><input value={form.municipio} onChange={e => setForm({...form, municipio: e.target.value })} className={inputClass} placeholder="Talatona" /></div>

                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={labelClass}>Cor Primária</label><input type="color" value={form.cor_primaria} onChange={e => setForm({...form, cor_primaria: e.target.value })} className="w-full h-12 rounded-xl border-white/20" /></div>
                                <div><label className={labelClass}>Cor Secundária</label><input type="color" value={form.cor_secundaria} onChange={e => setForm({...form, cor_secundaria: e.target.value })} className="w-full h-12 rounded-xl border border-white/20" /></div>
                            </div>

                            <div>
                                <label className={labelClass}>Tema</label>
                                <select value={form.tema} onChange={e => setForm({...form, tema: e.target.value })} className={inputClass}>
                                    <option value="claro">Claro</option>
                                    <option value="escuro">Escuro</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Logo da Escola</label>
                                <div className="relative">
                                    <input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" />
                                    <label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-dashed border-white/30 rounded-xl text-white/70 cursor-pointer hover:bg-white/20">
                                        <Upload className="w-4 h-4" /> Enviar Logo
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-white/20 rounded-xl text-white hover:bg-white/10">Cancelar</button>
                            <button onClick={salvar} disabled={saving} className="px-4 py-2 bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                                {saving? <Loader2 className="w-4 h-4 animate-spin" /> : null} Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
