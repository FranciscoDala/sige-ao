import { useState, useEffect } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
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
    const [isSuperAdmin, setIsSuperAdmin] = useState(false) // 1. Detecta se é super admin

    // 1. Buscar escolas ao carregar a página
    useEffect(() => {
        axios.get(`${API_URL}/escolas`)
        .then(res => {
            setEscolas(res.data)
        })
        .catch(err => {
            console.error("Erro ao buscar escolas", err)
        })
        .finally(() => setLoadingEscolas(false))
    }, [])

    // 2. Detecta se o email é de super admin
    useEffect(() => {
        setIsSuperAdmin(email.toLowerCase() === 'superadmin@sige-ao.gov.ao')
        if (email.toLowerCase() === 'superadmin@sige-ao.gov.ao') {
            setEscolaId('') // Limpa a escola se for super admin
        }
    }, [email])

    // 3. Enviar login para o backend
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSuperAdmin && !escolaId) { // Só valida escola se NÃO for super admin
            alert("Selecione uma escola")
            return
        }
        setLoading(true)
        try {
            const payload: any = {
                email,
                senha
            }
            // Só manda escola_id se não for super admin
            if (!isSuperAdmin) {
                payload.escola_id = escolaId
            }

            const res = await axios.post(`${API_URL}/auth/login`, payload)

            // Salva o token e redireciona
            localStorage.setItem('token', res.data.access_token)
            localStorage.setItem('nivel', res.data.nivel)
            localStorage.setItem('user', JSON.stringify(res.data.user))

            alert(`Login realizado! Bem-vindo. Nível: ${res.data.nivel}`)
            window.location.href = '/dashboard' // Descomenta quando tiver o dashboard

        } catch (err: any) {
            alert(err.response?.data?.detail || "Usuário ou senha inválidos")
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
            <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-72 h-72 bg-[#CF0921]/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-16 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-md bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${isSuperAdmin ? 'from-yellow-400 to-yellow-600' : 'from-[#CF0921] to-[#FFD700]'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all`}>
                        {isSuperAdmin ? <ShieldCheck className="w-8 h-8 text-black" /> : <School className="w-8 h-8 text-white" />}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-wider">SIGE-AO</h1>
                    <p className="text-white/60 text-sm mt-1">
                        {isSuperAdmin ? 'Acesso Global de Super Administrador' : 'Selecione sua escola para entrar'}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* SELECT DE ESCOLAS - SÓ APARECE SE NÃO FOR SUPER ADMIN */}
                    {!isSuperAdmin && (
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
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    )}

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

                <p className="text-center text-white/40 text-xs mt-6">© 2026 SIGE-AO. Versão 1.0</p>
            </div>
        </div>
    )
}

export default App
