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
    <div className="min-h-screen bg-gray-50 flex">

      {/* Lado Esquerdo - Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-700">S</span>
            </div>
            <h1 className="text-2xl font-bold">SIGE AO</h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Gestão Escolar <br /> Inteligente
          </h2>
          <p className="text-blue-100 text-lg">
            Modernizando a educação de Angola. Controle alunos, notas,
            turmas e relatórios em um só lugar.
          </p>
        </div>

        <div className="text-sm text-blue-200">
          Ministério da Educação - República de Angola
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-700 rounded-xl mb-3">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">SIGE AO</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</h2>
          <p className="text-gray-500 mb-8">Acesse sua conta para continuar</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                placeholder="nome@sige.ao"
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                Lembrar-me
              </label>
              <a href="#" className="text-sm font-medium text-blue-700 hover:text-blue-800 transition">
                Esqueci a senha
              </a>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : 'Entrar no Sistema'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-8">
            © 2026 SIGE AO. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
