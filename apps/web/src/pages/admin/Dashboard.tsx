import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner' // <- MUDOU
import { Header, EscolaCard, EscolaModal } from './components'
import { authService } from '../../services/auth'

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
    const navigate = useNavigate()
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editando, setEditando] = useState<Escola | null>(null)
    const [saving, setSaving] = useState(false)

    const token = authService.getToken()
    const nivel = authService.getNivel()
    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/', { replace: true }); return
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
            if (err.response?.status === 401) {
                authService.logout()
                navigate('/')
            }
        } finally {
            setLoading(false)
        }
    }

    const salvar = async (formData: FormData) => {
        if (!formData.get('nome')) { toast.error("Nome da escola é obrigatório"); return }
        setSaving(true)
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
        } catch (err: any) {
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
        authService.logout()
        navigate('/', { replace: true })
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>
            <Header onLogout={logout} />
            <main className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Gestão de Escolas</h2>
                        {nivel === 'MINISTERIO' && (
                            <button onClick={() => { setEditando(null); setModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-bold rounded-xl hover:scale-105 transition">
                                <Plus className="w-4 h-4" /> Nova Escola
                            </button>
                        )}
                    </div>

                    {loading? (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {escolas.map(escola => (
                                <EscolaCard
                                    key={escola.id}
                                    escola={escola}
                                    isMinisterio={nivel === 'MINISTERIO'}
                                    onEdit={(e) => { setEditando(e); setModalOpen(true) }}
                                    onDelete={deletar}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <EscolaModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={salvar}
                escola={editando}
                saving={saving}
            />
        </div>
    )
}
