import { useState, useEffect } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = "http://localhost:8000" // Troca pra URL do Render depois

interface Escola {
  id: string
  nome: string
}

function App() {
    const [escolas, setEscolas] = useState<Escola[]>([])
    const [escolaId, setEscolaId] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [showSenha, setShowSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingEscolas, setLoadingEscolas] = useState(true)

    // Busca escolas quando abre a tela
    useEffect(() => {
        axios.get(`${API_URL}/escolas`)
        .then(res => {
            setEscolas(res.data)
            setLoadingEscolas(false)
        })
        .catch(() => setLoadingEscolas(false))
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await axios.post(`${API_URL}/login`, {
                escola_id: escolaId,
                email,
                senha
            })
            localStorage.setItem('token', res.data.access_token)
            alert(`Login OK! Nível: ${res.data.nivel}`)
            // Aqui depois redireciona pro /dashboard
        } catch (err) {
            alert("Usuário ou senha inválidos para esta escola")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>

            <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-72 h-72 bg-[#CF0921]/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-16 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border-white/10 shadow-2xl">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#CF0921] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <School className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-wider">SIGE-AO</h1>
                    <p className="text-white/60 text-sm mt-1">Selecione sua escola para entrar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* SELECT DE ESCOLAS */}
                    <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
                        {loadingEscolas ? (
                             <div className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-white/20 rounded-xl text-white/70 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin"/> Carregando escolas...
                             </div>
                        ) : (
                            <select
                                value={escolaId}
                                onChange={(e) => setEscolaId(e.target.value)}
                                className="w-full appearance-none pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl
                                text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition"
                                required
                            >
                                <option value="" className="bg-black text-white">Selecione sua escola</option>
                                {escolas.map(escola => (
                                    <option key={escola.id} value={escola.id} className="bg-black text-white">
                                        {escola.nome}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            placeholder="E-mail" required />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input type={showSenha ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)}
                            className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                            placeholder="Senha" required />
                        <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                            {showSenha ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-[#CF0921] to-[#FFD700] hover:from-[#FFD700] hover:to-[#CF0921]
                        disabled:opacity-50 text-black font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>Entrar <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}
export default App
