import { useState } from 'react'

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
    <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center p-4">
      {/* Fundo com brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 blur-3xl"></div>

      <div className="relative w-full max-w-sm">

        {/* Card Principal Neo-Tactile */}
        <div className="bg-[#232736]/60 backdrop-blur-2xl rounded-[3rem] p-8 shadow-[20px_20px_60px_#151820,_-20px_-20px_60px_#2b3040] border-white/10">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl mb-4 shadow-[inset_4px_4px_8px_#0f1220,_inset_-4px_-4px_8px_#3a4a70]">
              <span className="text-4xl font-bold text-white">S</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">SIGE AO</h1>
            <p className="text-gray-400 text-sm">Sistema de Gestão Escolar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Input Neo-Tactile */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Email</label>
              <div className="bg-[#1a1d29] rounded-2xl p-1 shadow-[inset_5px_5px_10px_#151820,_inset_-5px_-5px_10px_#2b3040]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                  placeholder="admin@sige.ao"
                  required
                />
              </div>
            </div>

            {/* Input Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Senha</label>
              <div className="bg-[#1a1d29] rounded-2xl p-1 shadow-[inset_5px_5px_10px_#151820,_inset_-5px_-5px_10px_#2b3040]">
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Botão Neo-Tactile Active */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-2xl transition-all
              shadow-[8px_8px_16px_#151820,_-8px_-8px_16px_#2b3040] hover:shadow-[4px_4px_8px_#151820,_-4px_-4px_8px_#2b3040]
              active:shadow-[inset_4px_4px_8px_#0f4a9e,_inset_-4px_-4px_8px_#00c4ff] disabled:opacity-50"
            >
              {loading? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
