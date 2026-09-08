import {
    useState,
    useRef,
    useEffect,
    FormEvent,
    MouseEvent,
    ChangeEvent,
} from "react";
import {
    X,
    Loader2,
    User,
    Mail,
    Lock,
    Phone,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
    Building2,
    Shield,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { UsuarioMinisterio } from "../../types/usuario";

interface Escola {
    id: string;
    nome: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (data: {
        nome: string;
        email: string;
        senha?: string;
        telefone?: string;
        ativo?: boolean;
        nivel: string;
        escola_id?: string;
    }) => Promise<void>;
    saving: boolean;
    usuario: UsuarioMinisterio | null;
    escolas: Escola[];
}

const NIVEIS_USUARIO = [
    { value: "MINISTERIO", label: "Ministério - Admin Geral" },
    { value: "DIRETOR", label: "Diretor - Gerente da Escola" },
];

type FormState = {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    ativo: boolean;
    nivel: string;
    escola_id: string;
};

export default function UsuarioModal({
    open,
    onClose,
    onSave,
    saving,
    usuario,
    escolas,
}: Props) {
    const [form, setForm] = useState<FormState>({
        nome: "",
        email: "",
        senha: "",
        telefone: "",
        ativo: true,
        nivel: "DIRETOR",
        escola_id: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [dropdownNivel, setDropdownNivel] = useState(false);
    const [dropdownEscola, setDropdownEscola] = useState(false);

    const dropdownNivelRef = useRef<HTMLDivElement>(null);
    const dropdownEscolaRef = useRef<HTMLDivElement>(null);

    const isEdit = !!usuario;
    const mostrarSelectEscola = form.nivel === "DIRETOR";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | Event) => {
            const target = event.target as Node;

            if (dropdownNivelRef.current && !dropdownNivelRef.current.contains(target)) {
                setDropdownNivel(false);
            }
            if (dropdownEscolaRef.current && !dropdownEscolaRef.current.contains(target)) {
                setDropdownEscola(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return;

        if (isEdit && usuario) {
            setForm({
                nome: usuario.nome || "",
                email: usuario.email || "",
                senha: "",
                telefone: usuario.telefone || "",
                ativo: usuario.ativo ?? true,
                nivel: usuario.nivel || "DIRETOR",
                escola_id: usuario.escola_id || "",
            });
        } else {
            setForm({
                nome: "",
                email: "",
                senha: "",
                telefone: "",
                ativo: true,
                nivel: "DIRETOR",
                escola_id: "",
            });
        }

        setShowPassword(false);
    }, [open, usuario, isEdit]);

    if (!open) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.nome.trim()) {
            toast.error("O nome é obrigatório");
            return;
        }

        if (!form.email.trim()) {
            toast.error("O email é obrigatório");
            return;
        }

        if (!isEdit && (!form.senha || form.senha.length < 6)) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
            return;
        }

        if (mostrarSelectEscola && !form.escola_id) {
            toast.error("Selecione a escola do Diretor");
            return;
        }

        const payload: {
            nome: string;
            email: string;
            senha?: string;
            telefone?: string;
            ativo?: boolean;
            nivel: string;
            escola_id?: string;
        } = {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone || undefined,
            ativo: form.ativo,
            nivel: form.nivel,
            escola_id: form.escola_id || undefined,
        };

        if (form.senha) {
            payload.senha = form.senha;
        }

        if (isEdit && !payload.senha) {
            delete payload.senha;
        }

        if (form.nivel === "MINISTERIO") {
            delete payload.escola_id;
        }

        await onSave(payload);
    };

    const handleChange = (field: keyof FormState, value: string | boolean) => {
        if (field === "nivel" && value === "MINISTERIO") {
            setForm((prev) => ({ ...prev, nivel: value, escola_id: "" }));
            return;
        }

        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const inputClass =
        "w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition text-sm";
    const labelClass =
        "text-xs sm:text-right sm:justify-self-end text-gray-300 flex items-center gap-2";

    const CustomSelect = ({
        value,
        onSelect,
        options,
        placeholder,
        disabled = false,
        isOpen,
        setIsOpen,
        refDiv,
        isObject = true,
    }: any) => (
        <div ref={refDiv} className="relative sm:col-span-3">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-left text-sm text-white transition hover:bg-white/10 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50`}
            >
                <span className="truncate">
                    {isObject
                        ? options.find((o: any) => o.value === value)?.label || placeholder
                        : value || placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1E293B]/95 shadow-2xl shadow-black/30 backdrop-blur-2xl">
                    <div className="max-h-48 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {options.length === 0 && (
                            <p className="px-4 py-3 text-sm text-gray-400">Nenhuma opção</p>
                        )}

                        {options.map((op: any) => {
                            const optionValue = isObject ? op.value : op;
                            const optionLabel = isObject ? op.label : op;

                            return (
                                <button
                                    key={String(optionValue)}
                                    type="button"
                                    onClick={() => {
                                        onSelect(optionValue);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${value === optionValue
                                            ? "bg-[#3B82F6]/20 font-semibold text-[#3B82F6]"
                                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <span>{optionLabel}</span>
                                    {value === optionValue && (
                                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-2xl"
            >
                <div className="shrink-0 border-b border-white/10 p-4 pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEdit ? "Editar Usuário" : "Cadastrar Usuário"}
                            </h2>
                            <p className="mt-1 text-xs text-gray-400">
                                {isEdit ? "Atualizar os dados do usuário" : "Adicionar usuário para gerenciar"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-2 transition hover:bg-white/10"
                        >
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <User className="h-4 w-4" />
                                    Nome Completo *
                                </label>
                                <input
                                    value={form.nome}
                                    onChange={(e) => handleChange("nome", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="Ex: Maria da Silva"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <Mail className="h-4 w-4" />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="nome@minedu.gov.ao"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <Shield className="h-4 w-4" />
                                    Nível de Acesso *
                                </label>
                                <CustomSelect
                                    refDiv={dropdownNivelRef}
                                    value={form.nivel}
                                    onSelect={(val: string) => handleChange("nivel", val)}
                                    options={NIVEIS_USUARIO}
                                    placeholder="Selecione o Nível"
                                    isOpen={dropdownNivel}
                                    setIsOpen={setDropdownNivel}
                                    isObject={true}
                                />
                            </div>

                            {mostrarSelectEscola && (
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3 animate-in fade-in-0">
                                    <label className={labelClass}>
                                        <Building2 className="h-4 w-4" />
                                        Escola *
                                    </label>
                                    <CustomSelect
                                        refDiv={dropdownEscolaRef}
                                        value={form.escola_id}
                                        onSelect={(val: string) => handleChange("escola_id", val)}
                                        options={escolas.map((e) => ({ value: e.id, label: e.nome }))}
                                        placeholder="Selecione a Escola"
                                        isOpen={dropdownEscola}
                                        setIsOpen={setDropdownEscola}
                                        isObject={true}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <Lock className="h-4 w-4" />
                                    Senha {isEdit ? "" : "*"}
                                </label>

                                <div className="relative sm:col-span-3">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.senha}
                                        onChange={(e) => handleChange("senha", e.target.value)}
                                        className={`${inputClass} pr-10`}
                                        placeholder={
                                            isEdit ? "Deixe em branco para não alterar" : "Mínimo 6 caracteres"
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <Phone className="h-4 w-4" />
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    value={form.telefone}
                                    onChange={(e) => handleChange("telefone", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="+244 9xx xxx"
                                />
                            </div>

                            {isEdit && (
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                    <label className={labelClass}>Status</label>

                                    <button
                                        type="button"
                                        onClick={() => handleChange("ativo", !form.ativo)}
                                        className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm transition sm:col-span-3 ${form.ativo
                                                ? "border-green-500/30 bg-green-500/10"
                                                : "border-red-500/30 bg-red-500/10"
                                            }`}
                                    >
                                        <span
                                            className={`font-semibold ${form.ativo ? "text-green-400" : "text-red-400"
                                                }`}
                                        >
                                            {form.ativo ? "Ativo" : "Inativo"}
                                        </span>

                                        {form.ativo ? (
                                            <ToggleRight className="h-5 w-5 text-green-400" />
                                        ) : (
                                            <ToggleLeft className="h-5 w-5 text-red-400" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 bg-[#0F172A]/90 p-4 sm:flex-row">
                        <button
                            type="button"
                            onClick={onClose}
                            className="order-2 h-10 w-full rounded-xl border border-red-500/20 bg-red-500/15 px-6 text-sm font-semibold text-red-400 transition hover:bg-red-500/30 sm:order-1 sm:w-auto sm:flex-1"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="order-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-6 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/30 transition hover:shadow-[#3B82F6]/40 disabled:opacity-50 sm:order-2 sm:w-auto sm:flex-1"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {saving ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
