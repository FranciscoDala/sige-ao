import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios, { type AxiosError } from "axios";
import { toast } from "sonner";
import {
    AlertCircle,
    ArrowRight,
    Building2,
    ChevronDown,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    School,
    ShieldCheck,
    User,
} from "lucide-react";

import { authService } from "../../services/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const REQUEST_TIMEOUT = 60000;

interface Escola {
    id: string;
    nome: string;
    ativo: boolean;
}

interface UserInToken {
    id: string;
    email: string;
    nome: string;
    escola_id?: string | null;
    nivel: string;
}

interface LoginResponse {
    access_token: string;
    token_type: string;
    nivel: string;
    user: UserInToken;
    expires_in: number;
}

export default function Login() {
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [escolaId, setEscolaId] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [showSenha, setShowSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingEscolas, setLoadingEscolas] = useState(true);
    const [apiOnline, setApiOnline] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            const nivel = authService.getNivel()?.toUpperCase();
            if (nivel === "MINISTERIO") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchEscolas = async () => {
            setLoadingEscolas(true);
            try {
                const res = await axios.get<Escola[]>(`${API_URL}/escolas`, {
                    timeout: REQUEST_TIMEOUT,
                });

                setEscolas(res.data || []);
                setApiOnline(true);

                if ((res.data || []).length === 0) {
                    toast.warning("Nenhuma escola cadastrada no momento.");
                }
            } catch (err: any) {
                setApiOnline(false);
                const detail =
                    err.response?.data?.detail ||
                    err.message ||
                    "Erro ao carregar escolas.";

                toast.error(`Erro ao carregar escolas: ${detail}`);
            } finally {
                setLoadingEscolas(false);
            }
        };

        fetchEscolas();
    }, []);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isSuperAdmin && !escolaId) {
            toast.error("Selecione uma escola antes de continuar.");
            return;
        }

        const payload = {
            email: email.trim(),
            senha,
            escola_id: isSuperAdmin ? null : escolaId,
        };

        setLoading(true);

        try {
            const res = await axios.post<LoginResponse>(
                `${API_URL}/auth/login`,
                payload,
                { timeout: REQUEST_TIMEOUT }
            );

            authService.login({
                access_token: res.data.access_token,
                token_type: res.data.token_type,
                nivel: res.data.nivel,
                user: {
                    ...res.data.user,
                    escola_id: res.data.user.escola_id ?? null,
                },
            });

            toast.success(`Bem-vindo, ${res.data.user.nome}!`);

            const nivel = String(res.data.nivel).toUpperCase();

            setTimeout(() => {
                if (nivel === "MINISTERIO") {
                    navigate("/admin", { replace: true });
                } else {
                    navigate("/dashboard", { replace: true });
                }
            }, 300);
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            const msg =
                axiosError.response?.data?.detail ||
                "Usuário ou senha inválidos.";

            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full h-11 pl-10 pr-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50 text-sm";

    const dropdownButtonClass =
        "w-full h-11 px-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700] disabled:opacity-50 flex items-center justify-between text-left text-sm";

    const selectedEscola = escolas.find((e) => e.id === escolaId);

    const podeLogar =
        !loading &&
        !loadingEscolas &&
        apiOnline &&
        ((isSuperAdmin && email.trim().length > 0 && senha.length > 0) ||
            (!isSuperAdmin && !!escolaId && email.trim().length > 0 && senha.length > 0));

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                background:
                    "linear-gradient(135deg, #000000 0%, #CF0921 45%, #FFD700 100%)",
            }}
        >
            <div className="w-full max-w-[380px] bg-black/40 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-2xl text-white">
                {!apiOnline && (
                    <div className="mb-3 p-2.5 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        API Offline: {API_URL}
                    </div>
                )}

                <div className="text-center mb-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${isSuperAdmin
                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                : "bg-gradient-to-br from-[#CF0921] to-[#FFD700]"
                            }`}
                    >
                        {isSuperAdmin ? (
                            <ShieldCheck className="w-6 h-6 text-black" />
                        ) : (
                            <School className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <h1 className="text-xl font-bold">SIGE-AO</h1>
                    <p className="text-white/60 text-xs mt-1">
                        {isSuperAdmin
                            ? "Acesso global do Super Administrador"
                            : "Selecione a sua escola para entrar"}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3">
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                        <button
                            type="button"
                            onClick={() => setIsSuperAdmin(false)}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${!isSuperAdmin
                                    ? "bg-[#CF0921] text-white"
                                    : "text-white/70 hover:bg-white/5"
                                }`}
                        >
                            Escola
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSuperAdmin(true);
                                setEscolaId("");
                            }}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition ${isSuperAdmin
                                    ? "bg-yellow-400 text-black"
                                    : "text-white/70 hover:bg-white/5"
                                }`}
                        >
                            Global
                        </button>
                    </div>

                    {!isSuperAdmin && (
                        <div ref={dropdownRef} className="relative">
                            <label className="block text-xs text-white/80 mb-1.5">
                                Escola *
                            </label>

                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 z-10" />
                                <button
                                    type="button"
                                    className={dropdownButtonClass}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    disabled={loadingEscolas || !apiOnline}
                                >
                                    <span className="truncate">
                                        {selectedEscola ? selectedEscola.nome : "Selecione uma escola"}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-white/70" />
                                </button>
                            </div>

                            {dropdownOpen && (
                                <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-slate-900 shadow-2xl max-h-52 overflow-auto">
                                    {escolas.length === 0 ? (
                                        <div className="p-3 text-xs text-white/60">
                                            Nenhuma escola disponível
                                        </div>
                                    ) : (
                                        escolas.map((e) => (
                                            <button
                                                key={e.id}
                                                type="button"
                                                onClick={() => {
                                                    setEscolaId(e.id);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${escolaId === e.id ? "bg-white/10 text-yellow-300" : "text-white"
                                                    }`}
                                            >
                                                {e.nome}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-white/80 mb-1.5">
                            E-mail *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                className={inputClass}
                                placeholder="seu@email.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-white/80 mb-1.5">
                            Senha *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                type={showSenha ? "text" : "password"}
                                className={inputClass}
                                placeholder="••••••••"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowSenha(!showSenha)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                            >
                                {showSenha ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!podeLogar || loading}
                        className="w-full h-11 rounded-xl bg-[#FFD700] text-black font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#ffe55d]"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Entrando...
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2">
                                Entrar
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
