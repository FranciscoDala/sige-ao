import { useState, useEffect, FormEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, ChevronDown, Ban, Building2 } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { authService } from '../../services/auth'

const API_URL = import.meta.env.VITE_API_URL
const REQUEST_TIMEOUT = 60000

interface Escola { id: string; nome: string; ativo: boolean }
interface UserInToken {
    id: string;
    email: string;
    nome: string;
    escola_id?: string | null;
    nivel: string
}
interface LoginResponse { access_token: string; nivel: string; user: UserInToken; token_type: string; expires_in: number }

export default function Login() {
    const navigate = useNavigate()
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
        console.log('[DEBUG] Nivel Raiz:', authService.getNivel())
        console.log('[DEBUG] Nivel User:', authService.getUser()?.nivel)
    }, [])

    // Redireciona se já estiver logado - COM REPLACE
    useEffect(() => {
        if (authService.isAuthenticated()) {
            const nivel = authService.getNivel()?.toUpperCase()
            if (nivel === 'MINISTERIO') {
                navigate('/admin', { replace: true })
            } else {
                navigate('/dashboard', { replace: true })
            }
        }
    }, [navigate])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current &&!dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const fetchEscolas = async () => {
            setLoadingEscolas(true)
            try {
                const res = await axios.get<Escola[]>(`${API_URL}/escolas`, { timeout: REQUEST_TIMEOUT })
                setEscolas(res.data)
                setApiOnline(true)
                if (res.data.length === 0) toast.warning("Atenção: Nenhuma escola cadastrada")
            } catch (err: any) {
                setApiOnline(false)
                toast.error(`Erro ao carregar escolas: ${err.response?.data?.detail || err.message}`)
            } finally {
                setLoadingEscolas(false)
            }
        }
        fetchEscolas()
    }, [])

    useEffect(() => {
        // 👇 NOVA LÓGICA: Se tiver "admin" em qualquer lugar do email
        const emailLower = email.toLowerCase().trim()
        const isAdmin = emailLower.includes('admin')
        setIsSuperAdmin(isAdmin)
        if (isAdmin) setEscolaId('')
    }, [email])

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // 👇 IMPORTANTE: Quem decide é a API. Isso aqui é só pra UX
        if (!isSuperAdmin &&!escolaId) {
            toast.error("Selecione uma escola");
            return
        }

        const payload = {
            email,
            senha,
            escola_id: isSuperAdmin? null : escolaId
        }
        setLoading(true)

        axios.post<LoginResponse>(`${API_URL}/auth/login`, payload, { timeout: REQUEST_TIMEOUT })
        .then((res) => {
                authService.login({
                    access_token: res.data.access_token,
                    nivel: res.data.nivel, // 👈 A API DECIDE AQUI
                    user: {
                    ...res.data.user,
                        escola_id: res.data.user.escola_id?? undefined
                    }
                })
                toast.success(`Bem-vindo, ${res.data.user.nome}!`)

                const nivel = res.data.nivel?.toUpperCase() // 👈 CONFIA NA API
                setTimeout(() => {
                    if (nivel === 'MINISTERIO') {
                        navigate('/admin', { replace: true })
                    } else {
                        navigate('/dashboard', { replace: true })
                    }
                }, 500)
            })
        .catch((err: AxiosError<{ detail: string }>) => {
                const msg = err.response?.data?.detail || "Usuário ou senha inválidos"
                toast.error(msg)
            })
        .finally(() => setLoading(false))
    }

    // AJUSTE TAMANHO: h-10 text-sm | pl-10 para icones
    const inputClass = "w-full h-10 pl-10 pr-3 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50 text-sm"
    const dropdownButtonClass = "w-full h-10 px-3 pl-10 bg-white/10 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50 flex items-center justify-between text-left text-sm"
    const selectedEscola = escolas.find(e => e.id === escolaId)
    const podeLogar =!loading &&!loadingEscolas && apiOnline && (isSuperAdmin ||!!escolaId)

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>
            {/* AJUSTE TAMANHO: max-w-md -> max-w-[380px] | p-8 -> p-4 | rounded-3xl -> rounded-2xl */}
            <div className="w-full max-w-[380px] bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border-white/10 shadow-2xl text-white">

                {/* AJUSTE TAMANHO: mb-4 p-3 -> mb-3 p-2.5 | text-sm -> text-xs | w-5 -> w-4 */}
                {!apiOnline && <div className="mb-3 p-2.5 bg-red-500/20 border-red-500/50 rounded-xl flex gap-2 items-center text-xs"><AlertCircle className="w-4 h-4" />API Offline: {API_URL}</div>}

                {/* AJUSTE TAMANHO: mb-8 -> mb-4 | w-16 h-16 -> w-12 h-12 | w-8 -> w-6 | text-3xl -> text-xl */}
                <div className="text-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${isSuperAdmin? 'from-yellow-400 to-yellow-600' : 'from-[#CF0921] to-[#FFD700]'} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        {isSuperAdmin? <ShieldCheck className="w-6 h-6 text-black" /> : <School className="w-6 h-6 text-white" />}
                    </div>
                    <h1 className="text-xl font-bold">SIGE-AO</h1>
                    <p className="text-white/60 text-xs mt-1">{isSuperAdmin? 'Acesso Global de Super Administrador' : 'Selecione sua escola para entrar'}</p>
                </div>

                {/* AJUSTE TAMANHO: space-y-4 -> space-y-3 */}
                <form onSubmit={handleLogin} className="space-y-3">
                    {!isSuperAdmin && (
                        <div ref={dropdownRef} className="relative">
                            {/* AJUSTE TAMANHO: text-sm mb-1 -> text-xs mb-1.5 */}
                            <label className="text-xs text-white/80 mb-1.5 block">Escola *</label>
                            <div className="relative">
                                {/* AJUSTE TAMANHO: w-5 left-4 -> w-4 left-3 */}
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 z-10" />
                                <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} disabled={loadingEscolas ||!apiOnline} className={dropdownButtonClass}>
                                    <span className="truncate">{selectedEscola?.nome || (loadingEscolas? "Carregando escolas..." : "Selecione sua escola")}</span>
                                    <ChevronDown className={`w-4 h-4 text-white/50 flex-shrink-0 transition-transform ${dropdownOpen? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            {dropdownOpen && (
                                // AJUSTE TAMANHO: max-h-60 -> max-h-48 | px-4 py-3 -> px-3 py-2.5 | w-5 -> w-4
                                <div className="absolute z-10 w-full mt-2 bg-[#1A1A1A] border-white/20 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto py-1">
                                        {escolas.length === 0 && <div className="p-3 text-white/50 text-sm flex items-center gap-3"><School className="w-4 h-4 flex-shrink-0" />Nenhuma escola encontrada</div>}
                                        {escolas.map(e => (
                                            <button
                                                key={e.id}
                                                type="button"
                                                disabled={!e.ativo}
                                                onClick={() => { setEscolaId(e.id); setDropdownOpen(false) }}
                                                className={`w-full text-left px-3 py-2.5 transition flex items-center gap-3 text-sm ${!e.ativo? 'bg-white/5 text-white/30 cursor-not-allowed' :
                                                    escolaId === e.id? 'bg-[#CF0921]/40 text-[#FFD700]' : 'text-white hover:bg-[#CF0921]/30'
                                                    }`}
                                            >
                                                <School className={`w-4 h-4 flex-shrink-0 ${!e.ativo && 'opacity-40'}`} />
                                                <div className="flex-1">
                                                    <span>{e.nome}</span>
                                                    {!e.ativo && <span className="block text-xs text-red-400">Inativa</span>}
                                                </div>
                                                {!e.ativo && <Ban className="w-3.5 h-3.5 text-red-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs text-white/80 mb-1.5 block">Email</label>
                        <div className="relative">
                            {/* AJUSTE TAMANHO: w-5 left-4 -> w-4 left-3 */}
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="admin@sige.com ou nome@escola.ao" required />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-white/80 mb-1.5 block">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            {/* AJUSTE TAMANHO: pr-12 -> pr-10 */}
                            <input type={showSenha? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} className={`${inputClass} pr-10`} placeholder="********" required />
                            {/* AJUSTE TAMANHO: right-4 w-5 -> right-3 w-4 */}
                            <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">{showSenha? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                        </div>
                    </div>

                    {/* AJUSTE TAMANHO: py-3.5 -> h-10 | font-bold -> font-semibold | w-4 h-4 nos icones | text-sm */}
                    <button type="submit" disabled={!podeLogar} className="w-full h-10 bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] transition text-sm">
                        {loading? <><Loader2 className="w-4 h-4 animate-spin" /> Acessando...</> : <>Entrar <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}
