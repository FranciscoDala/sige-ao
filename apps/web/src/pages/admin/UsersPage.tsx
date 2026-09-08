import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
    Building,
    Building2,
    ChevronDown,
    Loader2,
    Plus,
    ShieldCheck,
    UserCheck,
    UserCog,
    UserX,
    Users,
} from "lucide-react";
import { toast } from "sonner";

import { UsuarioMinisterio } from "../types/usuario";
import StatCard from "./components/card_stat";
import UsuarioCard from "./components/card_usuario";
import UsuarioModal from "./components/modal_usuario";
import UsuarioViewModal from "./components/modal_usuarioView";
import ConfirmDeleteModal from "./components/modal_confirmDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface Escola {
    id: string;
    nome: string;
}

const getToken = (): string | null => localStorage.getItem("access_token");

export const api = axios.create({
    baseURL: API_URL,
    timeout: 60000,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const detail = error.response?.data?.detail || "Erro de requisição";

        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("nivel");
            localStorage.removeItem("user");
            window.location.href = "/#/";
            toast.error("Sessão expirada. Faça login novamente.");
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            toast.error(detail);
        }

        return Promise.reject(error);
    }
);

export default function UsersPage() {
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [usuarios, setUsuarios] = useState<UsuarioMinisterio[]>([]);
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<UsuarioMinisterio | null>(null);

    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [usuarioVisualizando, setUsuarioVisualizando] = useState<UsuarioMinisterio | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchEscolas = async () => {
        try {
            const res = await api.get<Escola[]>("/escolas");
            setEscolas(res.data || []);
        } catch (err: any) {
            console.error("Erro ao carregar escolas", err);
        }
    };

    const fetchUsuarios = async () => {
        setLoading(true);

        try {
            const params: Record<string, boolean | string> = {};

            if (filtroStatus === "ativo") params.ativo = true;
            if (filtroStatus === "inativo") params.ativo = false;

            const res = await api.get<any[]>("/usuarios", { params });

            const usuariosMapeados: UsuarioMinisterio[] = (res.data || []).map((u) => ({
                id: u.id,
                nome: u.nome,
                email: u.email,
                telefone: u.telefone ?? "",
                nivel: u.nivel,
                escola_id: u.escola_id ?? null,
                perfil: u.perfil,
                ativo: u.ativo ?? true,
                departamento: u.departamento || "Escola",
                created_at: u.criado_em || new Date().toISOString(),
            }));

            setUsuarios(usuariosMapeados);
        } catch (err: any) {
            const detail = err.response?.data?.detail || err.message || "Erro ao carregar usuários";
            toast.error(`Erro ao carregar usuários: ${detail}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchEscolas();
    }, [filtroStatus]);

    const handleSaveUsuario = async (data: {
        nome: string;
        email: string;
        senha?: string;
        telefone?: string;
        ativo?: boolean;
        nivel: string;
        escola_id?: string;
    }) => {
        setSaving(true);

        try {
            const payload: any = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone || null,
                ativo: data.ativo ?? true,
                nivel: data.nivel,
            };

            if (data.senha) {
                payload.senha = data.senha;
            }

            if (data.nivel === "MINISTERIO") {
                payload.escola_id = null;
            } else {
                payload.escola_id = data.escola_id || null;
            }

            if (usuarioEditando) {
                await api.put(`/usuarios/${usuarioEditando.id}`, payload);
                toast.success("Usuário atualizado!");
            } else {
                if (!payload.senha) {
                    throw new Error("Senha obrigatória para criar usuário.");
                }

                await api.post("/usuarios", payload);
                toast.success(
                    data.nivel === "MINISTERIO"
                        ? "Admin do Ministério criado!"
                        : "Usuário criado com sucesso!"
                );
            }

            setModalOpen(false);
            setUsuarioEditando(null);
            await fetchUsuarios();
        } catch (err: any) {
            const detail =
                err.response?.data?.detail ||
                err.message ||
                "Erro ao salvar usuário";

            toast.error(detail);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenCreate = () => {
        setUsuarioEditando(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (usuario: UsuarioMinisterio) => {
        setUsuarioEditando(usuario);
        setModalOpen(true);
    };

    const handleOpenView = (usuario: UsuarioMinisterio) => {
        setUsuarioVisualizando(usuario);
        setViewModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setUsuarioParaDeletar(id);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!usuarioParaDeletar) return;

        try {
            await api.delete(`/usuarios/${usuarioParaDeletar}`);
            toast.success("Usuário removido com sucesso.");
            await fetchUsuarios();
        } catch (err: any) {
            const detail = err.response?.data?.detail || "Erro ao remover usuário";
            toast.error(detail);
        } finally {
            setConfirmOpen(false);
            setUsuarioParaDeletar(null);
        }
    };

    const opcoesFiltro = [
        { value: "todos", label: "Todos os Usuários", icon: Users },
        { value: "ativo", label: "Apenas Ativos", icon: UserCheck },
        { value: "inativo", label: "Apenas Inativos", icon: UserX },
    ];

    const opcaoSelecionada = opcoesFiltro.find((o) => o.value === filtroStatus);

    const stats = [
        {
            title: "Total Usuários",
            value: usuarios.length,
            icon: Users,
            color: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]",
        },
        {
            title: "Usuários Ativos",
            value: usuarios.filter((u) => u.ativo).length,
            icon: UserCheck,
            color: "bg-gradient-to-br from-[#10B981] to-[#059669]",
        },
        {
            title: "Diretores",
            value: usuarios.filter((u) => u.nivel === "DIRETOR").length,
            icon: ShieldCheck,
            color: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]",
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <UserCog className="w-6 h-6 text-[#3B82F6]" />
                <div>
                    <h1 className="text-xl font-bold text-white">Usuários</h1>
                    <p className="text-xs text-gray-400">
                        Gerencie quem pode acessar o painel
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div ref={dropdownRef} className="relative w-full sm:w-1/2">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] flex items-center justify-between text-left backdrop-blur-xl hover:bg-white/10 transition-all duration-200 text-sm"
                    >
                        <div className="flex items-center gap-2 truncate">
                            {opcaoSelecionada && (
                                <opcaoSelecionada.icon className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
                            )}
                            <span className="truncate">{opcaoSelecionada?.label}</span>
                        </div>

                        <ChevronDown
                            className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-[#1E293B]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
                            <div className="max-h-60 overflow-y-auto overflow-x-hidden py-1">
                                {opcoesFiltro.map((op) => (
                                    <button
                                        key={op.value}
                                        type="button"
                                        onClick={() => {
                                            setFiltroStatus(op.value);
                                            setDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${filtroStatus === op.value
                                                ? "bg-[#3B82F6]/20 text-[#93C5FD]"
                                                : "text-white"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <op.icon className="w-4 h-4" />
                                            {op.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="h-10 px-4 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-medium flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Novo usuário
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                    />
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {usuarios.map((usuario) => (
                        <UsuarioCard
                            key={usuario.id}
                            usuario={usuario}
                            onView={() => handleOpenView(usuario)}
                            onEdit={() => handleOpenEdit(usuario)}
                            onDelete={() => handleDeleteClick(usuario.id)}
                        />
                    ))}
                </div>
            )}

            <UsuarioModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setUsuarioEditando(null);
                }}
                onSave={handleSaveUsuario}
                usuario={usuarioEditando}
                escolas={escolas}
                saving={saving}
            />

            <UsuarioViewModal
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                usuario={usuarioVisualizando}
            />

            <ConfirmDeleteModal
                open={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setUsuarioParaDeletar(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
