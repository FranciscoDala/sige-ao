import { useState } from 'react'
import { User, Lock, ArrowRight } from 'lucide-react'

function App() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            alert(`Login: ${email}`)
            setLoading(false)
        }, 1500)
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 app-wrapper"
            style={{
                background: 'linear-gradient(135deg, #0a4a8a 0%, #1e90ff 50%, #00c6ff 100%)' // <- AZUL DE VOLTA
            }}
            data-theme="dark"
            data-card-style="glass"
            data-card-size="medio"
        >

            {/* Bolhas e ondas de fundo */}
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-16 w-40 h-40 bg-cyan-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-bounce"></div>
                {/* Ondas */}
                <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320">
                    <path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L0,320Z"></path>
                </svg>
            </div>

            {/* Card Glass PRETO */}
            <div className="relative w-full max-w-sm bg-[#111111]/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">

                {/*
                Título
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-wider font-bricolage">LOGIN</h1>
                    <p className="text-white/70 text-sm">ACESSE SUA CONTA SIGE</p>
                </div>
                */}

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Input Usuário - FUNDO BRANCO IGUAL A PRINT */}
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-full
                text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primaria transition"
                            placeholder="E-mail"
                            required
                        />
                    </div>

                    {/* Input Senha - FUNDO BRANCO IGUAL A PRINT */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white rounded-full
                text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primaria transition"
                            placeholder="Senha"
                            required
                        />
                    </div>

                    {/* Botão Login - AZUL COM GLOW */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-[#0a4a8a] to-[#1e90ff] hover:from-[#1e90ff] hover:to-[#00c6ff]
                        disabled:opacity-50 text-white font-bold rounded-full transition flex items-center justify-center gap-2
                        shadow-lg shadow-[#0a4a8a]/40"
                    >
                        {loading ? 'Acessando...' :
                            <>
                                Acessar <ArrowRight className="w-5 h-5" />
                            </>
                        }
                    </button>
                </form>

                {/* Links */}
                <div className="text-center mt-6 space-y-2 text-sm">
                    <a href="#" className="block text-white/70 hover:text-white transition">Esqueceu a senha?</a>
                    <p className="text-white/60">
                        Não tem conta? <a href="#" className="text-white font-semibold hover:underline">Criar conta</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default App
