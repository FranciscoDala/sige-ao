import { useState, useEffect } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import axios, { AxiosError, AxiosResponse } from 'axios' // 1. Adicionei AxiosResponse aqui
import toast, { Toaster } from 'react-hot-toast'

import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Alert, AlertDescription } from "./components/ui/alert"


const API_URL = "http://localhost:8000"

interface Escola {
    id: string
    nome: string
}

interface LoginResponse {
    access_token: string
    nivel: string
    user: {
        id: string
        email: string
        nome: string
        escola_id?: string
    }
}

function App() {
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
            try {
                const res = await axios.get<Escola[]>(`${API_URL}/escolas`)
                setEscolas(res.data)
                setApiOnline(true)
            } catch (err) {
                const error = err as AxiosError
                console.error("Erro ao buscar escolas", error)
                setApiOnline(false)
                if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
                    toast.error('API Offline. Ligue o backend com: uvicorn app.main:app --reload')
                } else {
                    toast.error('Não foi possível carregar as escolas')
                }
            } finally {
                setLoadingEscolas(false)
            }
        }
        fetchEscolas()
    }, [])

    useEffect(() => {
        const isAdmin = email.toLowerCase() === 'superadmin@sige-ao.gov.ao'
        setIsSuperAdmin(isAdmin)
        if (isAdmin) {
            setEscolaId('')
        }
    }, [email])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSuperAdmin && !escolaId) {
            toast.error("Selecione uma escola")
            return
        }
        setLoading(true)
        const promise = axios.post<LoginResponse>(`${API_URL}/auth/login`, {
            email,
            senha,
            ...(!isSuperAdmin && { escola_id: escolaId })
        })

        toast.promise(promise, {
            loading: 'Acessando sistema...',
            success: (res: AxiosResponse<LoginResponse>) => { // 2. Mudei para AxiosResponse aqui
                localStorage.setItem('token', res.data.access_token)
                localStorage.setItem('nivel', res.data.nivel)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                setTimeout(() => window.location.href = '/dashboard', 1000)
                return `Bem-vindo! Nível: ${res.data.nivel}`
            },
            error: (err: AxiosError<{ detail: string }>) => {
                if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
                    return 'Erro: API Offline. Ligue o backend.'
                }
                return err.response?.data?.detail || "Usuário ou senha inválidos"
            },
        }).finally(() => setLoading(false))
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}
        >
            <Toaster position="top-center" toastOptions={{
                style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' },
                success: { iconTheme: { primary: '#FFD700', secondary: 'black' } },
                error: { iconTheme: { primary: '#CF0921', secondary: 'white' } },
            }} />

            <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-72 h-72 bg-[#CF0921]/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-16 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <Card className="relative w-full max-w-md bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl text-white">
                <CardHeader className="text-center">
                    {!apiOnline && (
                        <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500/50 text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                API Offline. Rode `uvicorn app.main:app --reload`
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className={`w-16 h-16 bg-gradient-to-br ${isSuperAdmin ? 'from-yellow-400 to-yellow-600' : 'from-[#CF0921] to-[#FFD700]'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all`}>
                        {isSuperAdmin ? <ShieldCheck className="w-8 h-8 text-black" /> : <School className="w-8 h-8 text-white" />}
                    </div>
                    <CardTitle className="text-3xl font-bold text-white tracking-wider">SIGE-AO</CardTitle>
                    <CardDescription className="text-white/60 text-sm mt-1">
                        {isSuperAdmin ? 'Acesso Global de Super Administrador' : 'Selecione sua escola para entrar'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {!isSuperAdmin && (
                            <div className="space-y-2">
                                <Label>Escola</Label>
                                <Select onValueChange={setEscolaId} value={escolaId} disabled={loadingEscolas || !apiOnline}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder={loadingEscolas ? "Carregando escolas..." : "Selecione sua escola"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-white/20 text-white">
                                        {escolas.map(escola => (
                                            <SelectItem key={escola.id} value={escola.id} className="focus:bg-white/10">
                                                {escola.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-[#FFD700]"
                                    placeholder="superadmin@sige-ao.gov.ao"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                                <Input
                                    type={showSenha ? "text" : "password"}
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-[#FFD700]"
                                    placeholder="********"
                                    required
                                />
                                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                                    {showSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || loadingEscolas || !apiOnline}
                            className="w-full py-6 bg-gradient-to-r from-[#CF0921] to-[#FFD700] hover:from-[#FFD700] hover:to-[#CF0921]
                            disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition
                            shadow-lg shadow-[#CF0921]/30 hover:shadow-[#FFD700]/30 hover:scale-[1.02]"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Acessando...</> :
                                <>
                                    Entrar no Sistema <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            }
                        </Button>
                    </form>
                    <p className="text-center text-white/40 text-xs mt-6">© 2026 SIGE-AO. Versão 1.0</p>
                </CardContent>
            </Card>
        </div>
    )
}

export default App
