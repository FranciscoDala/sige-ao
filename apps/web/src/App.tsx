import { useState } from 'react'

function App() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Aqui tu conecta com tua API depois
        setTimeout(() => {
            alert(`Login: ${email}`)
            setLoading(false)
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo + Titulo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
                        <span className="text-3xl font-bold text-white">S</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">SIGE AO</h1>
                    <p className="text-slate-400">Sistema de Gestão Escolar de Angola</p>
                </div>

                {/* Card Login */}
                <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-white mb-6">Acessar Conta</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email ou Usuário
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                                placeholder="admin@sige.ao"
                                required
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                                placeholder="••••"
                                required
                            />
                        </div>

                        {/* Esqueci senha */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded bg-white/5 border-white/10" />
                                Lembrar-me
                            </label>
                            <a href="#" className="text-blue-500 hover:text-blue-400 transition">
                                Esqueci a senha
                            </a>
                        </div>

                        {/* Botão */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Entrando...
                                </>
                            ) : 'Entrar'}
                        </button>
                    </form>
                </div>

                {/* Rodapé */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    © 2026 SIGE AO. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}

export default App
