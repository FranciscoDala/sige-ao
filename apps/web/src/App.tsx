import { useState, useEffect } from 'react'
import { User, Lock, ArrowRight, School, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import axios, { AxiosError, AxiosResponse } from 'axios'
import toast, { Toaster } from 'react-hot-toast'

import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Alert, AlertDescription } from "./components/ui/alert"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

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
                const res = await axios.get<Escola[]>(`${API_URL}/api/v1/escolas`)
                setEscolas(res.data)
                setApiOnline(true)
            } catch (err) {
                const error = err as AxiosError
                console.error("Erro ao buscar escolas", error)
                setApiOnline(false)
                toast.error(`API Offline. Verifique: ${API_URL}`)
            } finally {
                setLoadingEscolas(false)
            }
        }
        fetchEscolas()
    }, [])

    useEffect(() => {
        const isAdmin = email.toLowerCase() === 'superadmin@sige-ao.gov.ao'
        setIsSuperAdmin(isAdmin)
        if (isAdmin) setEscolaId('')
    }, [email])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSuperAdmin &&!escolaId) {
            toast.error("Selecione uma escola")
            return
        }
        setLoading(true)
        const promise = axios.post<LoginResponse>(`${API_URL}/api/v1/auth/login`, {
            email,
            senha,
          ...(!isSuperAdmin && { escola_id: escolaId })
        })

        toast.promise(promise, {
            loading: 'Acessando sistema...',
            success: (res: AxiosResponse<LoginResponse>) => {
                localStorage.setItem('token', res.data.access_token)
                localStorage.setItem('nivel', res.data.nivel)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                setTimeout(() => window.location.href = '/dashboard', 1000)
                return `Bem-vindo! Nível: ${res.data.nivel}`
            },
            error: (err: AxiosError<{ detail: string }>) => {
                if (err.code === 'ERR_NETWORK') return `Erro: API Offline em ${API_URL}`
                return err.response?.data?.detail || "Usuário ou senha inválidos"
            },
        }).finally(() => setLoading(false))
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #000 0%, #CF0921 50%, #FFD700 100%)' }}>
            <Toaster position="top-center" />
            <Card className="relative w-full max-w-md bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl text-white">
                <CardHeader className="text-center">
                    {!apiOnline && (
                        <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500/50 text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>API Offline. Verifique: {API_URL}</AlertDescription>
                        </Alert>
                    )}
                    <div className={`w-16 h-16 bg-gradient-to-br ${isSuperAdmin? 'from-yellow-400 to-yellow-600' : 'from-[#CF0921] to-[#FFD700]'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        {isSuperAdmin? <ShieldCheck className="w-8 h-8 text-black" /> : <School className="w-8 h-8 text-white" />}
                    </div>
                    <CardTitle className="text-3xl font-bold text-white">SIGE-AO</CardTitle>
                    <CardDescription className="text-white/60">{isSuperAdmin? 'Acesso Global' : 'Selecione sua escola'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {!isSuperAdmin && (
                            <div className="space-y-2">
                                <Label>Escola</Label>
                                <Select onValueChange={setEscolaId} value={escolaId} disabled={loadingEscolas ||!apiOnline}>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder={loadingEscolas? "Carregando escolas..." : "Selecione sua escola"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-black border-white/20 text-white">
                                        {escolas.map(escola => (<SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input type={showSenha? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} className="bg-white/10 border-white/20 text-white" required />
                        </div>
                        <Button type="submit" disabled={loading || loadingEscolas ||!apiOnline} className="w-full bg-gradient-to-r from-[#CF0921] to-[#FFD700] text-black font-bold">
                            {loading? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Acessando...</> : <>Entrar <ArrowRight className="w-5 h-5 ml-2" /></>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default App
