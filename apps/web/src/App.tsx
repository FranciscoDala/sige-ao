import { useState, useEffect, FormEvent, useRef } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ChevronDown } from 'lucide-react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL // https://sige-backend-7rv1.onrender.com/api/v1
const REQUEST_TIMEOUT = 60000
console.log("[INIT] API_URL USADA:", API_URL)

interface Escola { id: string; nome: string }
interface UserInToken { id: string; email: string; nome: string; escola_id?: string }
interface LoginResponse { access_token: string; nivel: string; user: UserInToken }

export default function App() {
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [escolaId, setEscolaId] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [showSenha, setShowSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingEscolas, setLoadingEscolas] = useState(true)
    const [apiOnline, setApiOnline] = useState(true)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchEscolas = async () => {
            setLoadingEscolas(true)
            const url = `${API_URL}/escolas`
            console.log("[FETCH_ESCOLAS] 1. Iniciando busca em:", url)
            try {
                const res = await axios.get<Escola[]>(url, { timeout: REQUEST_TIMEOUT })
                setEscolas(res.data)
                setApiOnline(true)
                if (res.data.length === 0) toast("Atenção: Nenhuma escola cadastrada no DB", { icon: '⚠️' })
            } catch (err: any) {
                console.error("[FETCH_ESCOLAS] ERRO COMPLETO:", err)
                setApiOnline(false)
                toast.error(`Erro ao carregar escolas: ${err.response?.status || ''} ${err.message}`)
            } finally {
                setLoadingEscolas(false)
            }
        }
        fetchEscolas()
    }, [])

    useEffect(() => {
        const isAdmin = email.toLowerCase().trim() === 'admin@sige.com'
        setIsSuperAdmin(isAdmin)
        if (isAdmin) setEscolaId('')
    }, [email])

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const payload = { email, senha, ...(!isSuperAdmin && { escola_id: escolaId }) }
        if (!isSuperAdmin && !escolaId) { toast.error("Selecione uma escola"); return }
        setLoading(true)

        axios.post<LoginResponse>(`${API_URL}/auth/login`, payload, { timeout: REQUEST_TIMEOUT })
            .then((res: AxiosResponse<LoginResponse>) => {
                localStorage.setItem('token', res.data.access_token)
                localStorage.setItem('nivel', res.data.nivel)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                toast.success(`Bem-vindo, ${res.data.user.nome}!`)
                setTimeout(() => window.location.href = '/dashboard', 1000)
            })
            .catch((err: AxiosError<{ detail: string }>) => {
                toast.error(err.response?.data?.detail || "Usuário ou senha inválidos")
            })
            .finally(() => setLoading(false))
    }

    const inputClass = "w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50"
    // Classe nova só pro dropdown pra alinhar igual
    const dropdownButtonClass = "w-full pl-4 pr-4 py-3.5 bg-white/10 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50 flex items-center justify-between text-left"
    const selectedEscola = escolas.find(e => e.id === escolaId)

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>
            <Toaster position="top-center" />
            <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border-white/10 shadow-2xl text-white">
                {!apiOnline && <div className="mb-4 p-3 bg-red-500/20 border-red-500/50 rounded-lg flex gap-2 items-center text-sm"><AlertCircle className="w-5 h-5" />API Offline: {API_URL}</div>}

                <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${isSuperAdmin ? 'from-yellow-400 to-yellow-600' : 'from-[#CF0921] to-[#FFD700]'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        {isSuperAdmin ? <ShieldCheck className="w-8 h-8 text-black" /> : <School className="w-8 h-8 text-white" />}
                    </div>
                    <h1 className="text-3xl font-bold">SIGE-AO</h1>
                    <p className="text-white/60 text-sm">{isSuperAdmin ? 'Acesso Global de Super Administrador' : 'Selecione sua escola para entrar'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {!isSuperAdmin && (
                        <div ref={dropdownRef} className="relative">
                            <label className="text-sm text-white/80 mb-1 block">Escola</label>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                disabled={loadingEscolas || !apiOnline}
                                className={dropdownButtonClass}
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <School className="w-5 h-5 text-white/50 flex-shrink-0" />
                                    <span className="truncate">{selectedEscola?.nome || (loadingEscolas ? "Carregando escolas..." : "Selecione sua escola")}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-[#1A1A1A] border-white/20 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="max-h-60 overflow-y-auto">
                                        {escolas.length === 0 && <div className="p-3 pl-4 text-white/50 text-sm flex items-center gap-3"><School className="w-5 h-5 flex-shrink-0" />Nenhuma escola encontrada</div>}
                                        {escolas.map(e => (
                                            <button
                                                key={e.id}
                                                type="button"
                                                onClick={() => { setEscolaId(e.id); setDropdownOpen(false) }}
                                                className={`w-full text-left px-4 py-3 hover:bg-[#CF0921]/30 transition flex items-center gap-3 ${escolaId === e.id ? 'bg-[#CF0921]/40 text-[#FFD700]' : 'text-white'}`}
                                            >
                                                <School className="w-5 h-5 flex-shrink-0" />
                                                <span>{e.nome}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-sm text-white/80 mb-1 block">Email</label>
                        <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="superadmin@sige-ao.gov.ao" required /></div>
                    </div>
                    <div>
                        <label className="text-sm text-white/80 mb-1 block">Senha</label>
                        <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" /><input type={showSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} className={`${inputClass} pr-12`} placeholder="********" required /><button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">{showSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
                    </div>
                    <button type="submit" disabled={loading || loadingEscolas || !apiOnline} className="w-full py-3.5 bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] transition">
                        {loading ? <><Loader2 className="animate-spin" /> Acessando...</> : <>Entrar <ArrowRight /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}
