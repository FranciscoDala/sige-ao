import { useState, useEffect } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = "http://localhost:8000" // Depois troca pra https://api-sige-ao.onrender.com

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

    // 1. Buscar escolas ao carregar a página
    useEffect(() => {
        axios.get(`${API_URL}/escolas`)
        .then(res => {
            setEscolas(res.data)
        })
        .catch(err => {
            console.error("Erro ao buscar escolas", err)
            alert("Não foi possível carregar as escolas. Verifique o backend.")
        })
        .finally(() => setLoadingEscolas(false))
    }, [])

    // 2. Enviar login para o backend
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!escolaId) {
            alert("Selecione uma escola")
            return
        }
        setLoading(true)
        try {
            const res = await axios.post(`${API_URL}/login`, {
                escola_id: escolaId,
                email,
                senha
            })

            // Salva o token e redireciona
            localStorage.setItem('token', res.data.access_token)
            localStorage.setItem('nivel', res.data.nivel)
            alert(`Login realizado! Bem-vindo. Nível: ${res.data.nivel}`)
            // window.location.href = '/dashboard' // Descomenta quando tiver o dashboard

        } catch (err: any) {
            alert(err.response?.data?.detail || "Usuário ou senha inválidos para esta escola")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
            style={{
                background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)'
            }}
        >

            {/* Efeitos de fundo */}
            <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-72 h-72 bg-[#CF0921]/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-16 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2MkgydjJoMjR6bTAtNGgtMnYyaDJ2LTJ6bTItNGgtMnYyaDJ2LTJ6bTQtNGgtMnYyaDJ2LTJ6bTItNGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            </div>

            {/* Card Glass */}
            <div className="relative w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">

                {/* Header SIGE-AO */}
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
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none z-10" />
                        {loadingEscolas ? (
                             <div className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-white/20 rounded-xl text-white/70 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin"/> Carregando escolas...
                             </div>
                        ) : (
                            <select
                                value={escolaId}
                                onChange={(e) => setEscolaId(e.target.value)}
                                className="w-full appearance-none pl-12 pr-10 py-3.5 bg-white/10 border-white/20 rounded-xl
                                text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition"
                                required
                            >
                                <option value="" disabled className="bg-black text-white">Selecione sua escola</option>
                                {escolas.map(escola => (
                                    <option key={escola.id} value={escola.id} className="bg-black text-white">
                                        {escola.nome}
                                    </option>
                                ))}
                            </select>
                        )}
                        {/* Seta do select */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    {/* Input Email */}
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl
                            text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition"
                            placeholder="E-mail"
                            required
                        />
                    </div>

                    {/* Input Senha */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                        <input
                            type={showSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl
                            text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition"
                            placeholder="Senha"
                            required
                        />
                        <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                            {showSenha ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>

                    {/* Botão Login */}
                    <button
                        type="submit"
                        disabled={loading || loadingEscolas}
                        className="w-full py-3.5 bg-gradient-to-r from-[#CF0921] to-[#FFD700] hover:from-[#FFD700] hover:to-[#CF0921]
                        disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition flex items-center justify-center gap-2
                        shadow-lg shadow-[#CF0921]/30 hover:shadow-[#FFD700]/30 hover:scale-[1.02]"
                    >
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Acessando...</> :
                            <>
                                Entrar no Sistema <ArrowRight className="w-5 h-5" />
                            </>
                        }
                    </button>
                </form>

                {/* Links */}
                <div className="text-center mt-6 space-y-2 text-sm">
                    <a href="#" className="block text-white/70 hover:text-[#FFD700] transition">Esqueceu a senha?</a>
                    <p className="text-white/60">
                        Precisa de acesso? <a href="#" className="text-white font-semibold hover:text-[#FFD700] transition">Fale com a Direção</a>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-white/40 text-xs mt-6">© 2026 SIGE-AO. Versão 1.0</p>
            </div>
        </div>
    )
}

export default App
