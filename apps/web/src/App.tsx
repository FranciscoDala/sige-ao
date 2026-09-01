import { useState, useEffect, FormEvent } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"
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

  useEffect(() => {
    const fetchEscolas = async () => {
      setLoadingEscolas(true)
      console.log("[FETCH_ESCOLAS] 1. Iniciando busca em:", `${API_URL}/api/v1/escolas`)
      try {
        const res = await axios.get<Escola[]>(`${API_URL}/api/v1/escolas`)
        console.log("[FETCH_ESCOLAS] 2. Status:", res.status)
        console.log("[FETCH_ESCOLAS] 3. Dados:", res.data)
        setEscolas(res.data)
        setApiOnline(true)
        if(res.data.length === 0) toast("Atenção: Nenhuma escola ativa no DB")
      } catch (err: any) {
        console.error("[FETCH_ESCOLAS] ERRO:", err.response?.data || err.message)
        setApiOnline(false)
        toast.error(`Erro ao carregar escolas: ${err.message}`)
      } finally {
        setLoadingEscolas(false)
        console.log("[FETCH_ESCOLAS] 4. Finalizado")
      }
    }
    fetchEscolas()
  }, [])

  useEffect(() => {
    const isAdmin = email.toLowerCase().trim() === 'superadmin@sige-ao.gov.ao'
    console.log("[EMAIL_CHANGE] Email:", email, "IsSuper:", isAdmin)
    setIsSuperAdmin(isAdmin)
    if (isAdmin) setEscolaId('')
  }, [email])

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const payload = { email, senha,...(!isSuperAdmin && { escola_id: escolaId }) }
    console.log("[LOGIN] Payload enviado:", payload)

    if (!isSuperAdmin &&!escolaId) { toast.error("Selecione uma escola"); return }
    setLoading(true)

    axios.post<LoginResponse>(`${API_URL}/api/v1/auth/login`, payload)
  .then((res: AxiosResponse<LoginResponse>) => {
      console.log("[LOGIN] Sucesso:", res.data)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('nivel', res.data.nivel)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success(`Bem-vindo, ${res.data.user.nome}!`)
      setTimeout(() => window.location.href = '/dashboard', 1000)
    })
  .catch((err: AxiosError<{ detail: string }>) => {
      console.error("[LOGIN] Erro:", err.response?.data)
      toast.error(err.response?.data?.detail || "Usuário ou senha inválidos")
    })
  .finally(() => setLoading(false))
  }

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50"

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 text-white">
        {!apiOnline && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex gap-2 items-center"><AlertCircle/>API Offline: {API_URL}</div>}

        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${isSuperAdmin? 'from-yellow-400 to-yellow-600': 'from-[#CF0921] to-[#FFD700]'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            {isSuperAdmin? <ShieldCheck className="w-8 h-8 text-black" />: <School className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold">SIGE-AO</h1>
          <p className="text-white/60 text-sm">{isSuperAdmin? 'Acesso Global de Super Administrador': 'Selecione sua escola para entrar'}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {!isSuperAdmin && (
            <div>
              <label className="text-sm text-white/80 mb-1 block">Escola</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none"/>
                <select value={escolaId} onChange={(e) => setEscolaId(e.target.value)} disabled={loadingEscolas ||!apiOnline} className={`${inputClass} appearance-none`}>
                  <option value="" disabled className="bg-black">{loadingEscolas? "Carregando escolas...": "Selecione sua escola"}</option>
                  {escolas.map(e => <option key={e.id} value={e.id} className="bg-black">{e.nome}</option>)}
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-white/80 mb-1 block">Email</label>
            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"/><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="superadmin@sige-ao.gov.ao" required /></div>
          </div>
          <div>
            <label className="text-sm text-white/80 mb-1 block">Senha</label>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"/><input type={showSenha? "text": "password"} value={senha} onChange={(e) => setSenha(e.target.value)} className={`${inputClass} pr-12`} placeholder="********" required /><button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">{showSenha? <EyeOff className="w-5 h-5"/>: <Eye className="w-5 h-5"/>}</button></div>
          </div>
          <button type="submit" disabled={loading || loadingEscolas ||!apiOnline} className="w-full py-3.5 bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02] transition">
            {loading? <Loader2 className="animate-spin"/>: <>Entrar <ArrowRight/></>}
          </button>
        </form>
      </div>
    </div>
  )
}
