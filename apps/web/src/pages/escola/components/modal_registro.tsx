import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type RefObject,
} from "react";
import {
    X,
    Loader2,
    User,
    Phone,
    Mail,
    Calendar,
    IdCard,
    MapPin,
    ChevronDown,
    GraduationCap,
    Briefcase,
    Users,
    BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface Escola {
    id: string;
    nome: string;
}

interface Turma {
    id: string;
    nome: string;
}

interface Option {
    value: string;
    label: string;
}

interface PessoaVinculo {
    id: string;
    escola_id: string;
    tipo: string;
    numero_funcional?: string | null;
    cargo?: string | null;
    formacao?: string | null;
    disciplinas?: string | null;
    numero_processo?: string | null;
    turma_id?: string | null;
    observacao?: string | null;
    ativo: boolean;
}

interface Pessoa {
    id: string;
    nome: string;
    bi: string;
    data_nascimento?: string | null;
    sexo?: string | null;
    estado_civil?: string | null;
    telefone?: string | null;
    email?: string | null;
    endereco?: string | null;
    ativo: boolean;
    vinculos: PessoaVinculo[];
}

export interface PessoaCreatePayload {
    nome: string;
    bi: string;
    data_nascimento: string | null;
    sexo: string | null;
    estado_civil: string | null;
    telefone: string | null;
    email: string | null;
    endereco: string | null;
    escola_id: string;
    tipo: string;
    numero_funcional: string | null;
    cargo: string | null;
    formacao: string | null;
    disciplinas: string | null;
    numero_processo: string | null;
    turma_id: string | null;
    observacao: string | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (data: PessoaCreatePayload) => Promise<void>;
    saving: boolean;
    pessoa: Pessoa | null;
    escolas: Escola[];
    turmas: Turma[];
}

const TIPOS_VINCULO: Option[] = [
    { value: "ALUNO", label: "Aluno" },
    { value: "PROFESSOR", label: "Professor" },
    { value: "FUNCIONARIO", label: "Funcionário" },
    { value: "ENCARREGADO", label: "Encarregado" },
];

const SEXO_OPTIONS: Option[] = [
    { value: "MASCULINO", label: "Masculino" },
    { value: "FEMININO", label: "Feminino" },
];

const ESTADO_CIVIL_OPTIONS: Option[] = [
    { value: "SOLTEIRO", label: "Solteiro" },
    { value: "CASADO", label: "Casado" },
    { value: "DIVORCIADO", label: "Divorciado" },
    { value: "VIUVO", label: "Viúvo" },
];

const CARGO_OPTIONS: Option[] = [
    { value: "SECRETARIO", label: "Secretário" },
    { value: "DIRETOR_GERAL", label: "Diretor Geral" },
    { value: "PEDAGOGICO", label: "Pedagógico" },
    { value: "LIMPEZA", label: "Limpeza" },
    { value: "SEGURANCA", label: "Segurança" },
    { value: "OUTRO", label: "Outro" },
];

type FormState = {
    nome: string;
    bi: string;
    data_nascimento: string;
    sexo: string;
    estado_civil: string;
    telefone: string;
    email: string;
    endereco: string;
    escola_id: string;
    tipo: string;
    numero_funcional: string;
    cargo: string;
    formacao: string;
    disciplinas: string;
    numero_processo: string;
    turma_id: string;
    observacao: string;
};

type DropdownState = {
    tipo: boolean;
    sexo: boolean;
    ec: boolean;
    escola: boolean;
    cargo: boolean;
    turma: boolean;
};

type DropdownKey = keyof DropdownState;

interface CustomSelectProps {
    refDiv: RefObject<HTMLDivElement | null>;
    value: string;
    onSelect: (value: string) => void;
    options: Option[];
    placeholder: string;
    isOpen: boolean;
    onToggle: () => void;
}

const INITIAL_FORM: FormState = {
    nome: "",
    bi: "",
    data_nascimento: "",
    sexo: "",
    estado_civil: "",
    telefone: "",
    email: "",
    endereco: "",
    escola_id: "",
    tipo: "ALUNO",
    numero_funcional: "",
    cargo: "",
    formacao: "",
    disciplinas: "",
    numero_processo: "",
    turma_id: "",
    observacao: "",
};

const INITIAL_DROPDOWN: DropdownState = {
    tipo: false,
    sexo: false,
    ec: false,
    escola: false,
    cargo: false,
    turma: false,
};

function CustomSelect({
    refDiv,
    value,
    onSelect,
    options,
    placeholder,
    isOpen,
    onToggle,
}: CustomSelectProps) {
    const selectedOption = options.find((option) => option.value === value);

    return (
        <div ref={refDiv} className="relative sm:col-span-3">
            <button
                type="button"
                onClick={onToggle}
                className="flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-left text-base text-white transition hover:bg-white/10 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] sm:text-sm"
            >
                <span className="truncate">
                    {selectedOption?.label || placeholder}
                </span>

                <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1E293B]/95 shadow-2xl shadow-black/30 backdrop-blur-2xl">
                    <div className="max-h-48 overflow-y-auto overflow-x-hidden py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {options.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-gray-400">
                                Nenhuma opção
                            </p>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onSelect(option.value);
                                        onToggle();
                                    }}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                                        value === option.value
                                            ? "bg-[#3B82F6]/20 font-semibold text-[#3B82F6]"
                                            : "text-gray-300 hover:bg-white/10"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PessoaModal({
    open,
    onClose,
    onSave,
    saving,
    pessoa,
    escolas,
    turmas,
}: Props) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [dropdown, setDropdown] =
        useState<DropdownState>(INITIAL_DROPDOWN);

    const refs: Record<
        DropdownKey,
        RefObject<HTMLDivElement | null>
    > = {
        tipo: useRef<HTMLDivElement>(null),
        sexo: useRef<HTMLDivElement>(null),
        ec: useRef<HTMLDivElement>(null),
        escola: useRef<HTMLDivElement>(null),
        cargo: useRef<HTMLDivElement>(null),
        turma: useRef<HTMLDivElement>(null),
    };

    const isEdit = Boolean(pessoa);
    const tipo = form.tipo;

    const toggleDropdown = (key: DropdownKey) => {
        setDropdown((previous) => ({
            ...previous,
            [key]: !previous[key],
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            const clickedInsideDropdown = (
                Object.keys(refs) as DropdownKey[]
            ).some((key) => {
                const ref = refs[key];
                return ref.current?.contains(target);
            });

            if (!clickedInsideDropdown) {
                setDropdown(INITIAL_DROPDOWN);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    useEffect(() => {
        if (!open) {
            return;
        }

        if (pessoa) {
            const vinculo = pessoa.vinculos?.[0];

            setForm({
                nome: pessoa.nome || "",
                bi: pessoa.bi || "",
                data_nascimento:
                    pessoa.data_nascimento?.split("T")[0] || "",
                sexo: pessoa.sexo || "",
                estado_civil: pessoa.estado_civil || "",
                telefone: pessoa.telefone || "",
                email: pessoa.email || "",
                endereco: pessoa.endereco || "",
                escola_id: vinculo?.escola_id || "",
                tipo: vinculo?.tipo || "ALUNO",
                numero_funcional: vinculo?.numero_funcional || "",
                cargo: vinculo?.cargo || "",
                formacao: vinculo?.formacao || "",
                disciplinas: vinculo?.disciplinas || "",
                numero_processo: vinculo?.numero_processo || "",
                turma_id: vinculo?.turma_id || "",
                observacao: vinculo?.observacao || "",
            });
        } else {
            setForm(INITIAL_FORM);
        }

        setDropdown(INITIAL_DROPDOWN);
    }, [open, pessoa]);

    if (!open) {
        return null;
    }

    const handleChange = (
        field: keyof FormState,
        value: string,
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const nome = form.nome.trim();
        const bi = form.bi.trim();

        if (!nome) {
            toast.error("Nome é obrigatório");
            return;
        }

        if (!bi) {
            toast.error("BI é obrigatório");
            return;
        }

        if (!form.escola_id) {
            toast.error("Selecione a escola");
            return;
        }

        if (!form.tipo) {
            toast.error("Selecione o tipo de vínculo");
            return;
        }

        if (tipo === "ALUNO" && !form.numero_processo.trim()) {
            toast.error("Nº de processo é obrigatório para aluno");
            return;
        }

        if (tipo === "PROFESSOR" && !form.formacao.trim()) {
            toast.error("Formação é obrigatória para professor");
            return;
        }

        if (tipo === "FUNCIONARIO" && !form.cargo) {
            toast.error("Cargo é obrigatório para funcionário");
            return;
        }

        const payload: PessoaCreatePayload = {
            nome,
            bi,
            data_nascimento: form.data_nascimento || null,
            sexo: form.sexo || null,
            estado_civil: form.estado_civil || null,
            telefone: form.telefone.trim() || null,
            email: form.email.trim() || null,
            endereco: form.endereco.trim() || null,
            escola_id: form.escola_id,
            tipo: form.tipo,

            numero_funcional:
                tipo === "FUNCIONARIO"
                    ? form.numero_funcional.trim() || null
                    : null,

            cargo:
                tipo === "FUNCIONARIO"
                    ? form.cargo || null
                    : null,

            formacao:
                tipo === "PROFESSOR"
                    ? form.formacao.trim() || null
                    : null,

            disciplinas:
                tipo === "PROFESSOR"
                    ? form.disciplinas.trim() || null
                    : null,

            numero_processo:
                tipo === "ALUNO"
                    ? form.numero_processo.trim() || null
                    : null,

            turma_id:
                tipo === "ALUNO"
                    ? form.turma_id || null
                    : null,

            observacao: form.observacao.trim() || null,
        };

        await onSave(payload);
    };

    const inputClass =
        "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-base text-white placeholder:text-gray-400 transition focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] sm:text-sm";

    const labelClass =
        "flex items-center gap-2 text-xs text-gray-300 sm:justify-self-end";

    const escolaOptions = escolas.map((escola) => ({
        value: escola.id,
        label: escola.nome,
    }));

    const turmaOptions = turmas.map((turma) => ({
        value: turma.id,
        label: turma.nome,
    }));

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="flex max-h-[90vh] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/90 shadow-2xl backdrop-blur-2xl">
                <div className="shrink-0 border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">
                            {isEdit ? "Editar Pessoa" : "Cadastrar Pessoa"}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 transition hover:bg-white/10"
                            aria-label="Fechar modal"
                        >
                            <X className="h-5 w-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-4 py-4">
                        <h3 className="text-sm font-semibold text-[#3B82F6]">
                            Dados Pessoais
                        </h3>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                <User className="h-4 w-4" />
                                Nome *
                            </label>

                            <input
                                value={form.nome}
                                onChange={(event) =>
                                    handleChange("nome", event.target.value)
                                }
                                className={`${inputClass} sm:col-span-3`}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                <IdCard className="h-4 w-4" />
                                BI *
                            </label>

                            <input
                                value={form.bi}
                                onChange={(event) =>
                                    handleChange("bi", event.target.value)
                                }
                                className={`${inputClass} sm:col-span-3`}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                <Calendar className="h-4 w-4" />
                                Data Nasc.
                            </label>

                            <input
                                type="date"
                                value={form.data_nascimento}
                                onChange={(event) =>
                                    handleChange(
                                        "data_nascimento",
                                        event.target.value,
                                    )
                                }
                                className={`${inputClass} sm:col-span-3`}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>Sexo</label>

                            <CustomSelect
                                refDiv={refs.sexo}
                                value={form.sexo}
                                onSelect={(value) =>
                                    handleChange("sexo", value)
                                }
                                options={SEXO_OPTIONS}
                                placeholder="Selecione"
                                isOpen={dropdown.sexo}
                                onToggle={() => toggleDropdown("sexo")}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                Estado Civil
                            </label>

                            <CustomSelect
                                refDiv={refs.ec}
                                value={form.estado_civil}
                                onSelect={(value) =>
                                    handleChange("estado_civil", value)
                                }
                                options={ESTADO_CIVIL_OPTIONS}
                                placeholder="Selecione"
                                isOpen={dropdown.ec}
                                onToggle={() => toggleDropdown("ec")}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                <Phone className="h-4 w-4" />
                                Telefone
                            </label>

                            <input
                                value={form.telefone}
                                onChange={(event) =>
                                    handleChange(
                                        "telefone",
                                        event.target.value,
                                    )
                                }
                                className={`${inputClass} sm:col-span-3`}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                <Mail className="h-4 w-4" />
                                Email
                            </label>

                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) =>
                                    handleChange("email", event.target.value)
                                }
                                className={`${inputClass} sm:col-span-3`}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>
                                <MapPin className="h-4 w-4" />
                                Endereço
                            </label>

                            <input
                                value={form.endereco}
                                onChange={(event) =>
                                    handleChange(
                                        "endereco",
                                        event.target.value,
                                    )
                                }
                                className={`${inputClass} sm:col-span-3`}
                            />
                        </div>

                        <div className="my-2 border-t border-white/10" />

                        <h3 className="text-sm font-semibold text-[#3B82F6]">
                            Vínculo com a Escola
                        </h3>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>Escola *</label>

                            <CustomSelect
                                refDiv={refs.escola}
                                value={form.escola_id}
                                onSelect={(value) =>
                                    handleChange("escola_id", value)
                                }
                                options={escolaOptions}
                                placeholder="Selecione a Escola"
                                isOpen={dropdown.escola}
                                onToggle={() => toggleDropdown("escola")}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label className={labelClass}>Tipo *</label>

                            <CustomSelect
                                refDiv={refs.tipo}
                                value={form.tipo}
                                onSelect={(value) =>
                                    handleChange("tipo", value)
                                }
                                options={TIPOS_VINCULO}
                                placeholder="Selecione o Tipo"
                                isOpen={dropdown.tipo}
                                onToggle={() => toggleDropdown("tipo")}
                            />
                        </div>

                        {tipo === "ALUNO" && (
                            <>
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label className={labelClass}>
                                        <BookOpen className="h-4 w-4" />
                                        Nº Processo *
                                    </label>

                                    <input
                                        value={form.numero_processo}
                                        onChange={(event) =>
                                            handleChange(
                                                "numero_processo",
                                                event.target.value,
                                            )
                                        }
                                        className={`${inputClass} sm:col-span-3`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label className={labelClass}>
                                        <Users className="h-4 w-4" />
                                        Turma
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.turma}
                                        value={form.turma_id}
                                        onSelect={(value) =>
                                            handleChange("turma_id", value)
                                        }
                                        options={turmaOptions}
                                        placeholder="Selecione a Turma"
                                        isOpen={dropdown.turma}
                                        onToggle={() =>
                                            toggleDropdown("turma")
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {tipo === "PROFESSOR" && (
                            <>
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label className={labelClass}>
                                        Formação *
                                    </label>

                                    <input
                                        value={form.formacao}
                                        onChange={(event) =>
                                            handleChange(
                                                "formacao",
                                                event.target.value,
                                            )
                                        }
                                        className={`${inputClass} sm:col-span-3`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label className={labelClass}>
                                        <GraduationCap className="h-4 w-4" />
                                        Disciplinas
                                    </label>

                                    <input
                                        value={form.disciplinas}
                                        onChange={(event) =>
                                            handleChange(
                                                "disciplinas",
                                                event.target.value,
                                            )
                                        }
                                        className={`${inputClass} sm:col-span-3`}
                                    />
                                </div>
                            </>
                        )}

                        {tipo === "FUNCIONARIO" && (
                            <>
                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label className={labelClass}>
                                        <Briefcase className="h-4 w-4" />
                                        Nº Funcional
                                    </label>

                                    <input
                                        value={form.numero_funcional}
                                        onChange={(event) =>
                                            handleChange(
                                                "numero_funcional",
                                                event.target.value,
                                            )
                                        }
                                        className={`${inputClass} sm:col-span-3`}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label className={labelClass}>
                                        Cargo *
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.cargo}
                                        value={form.cargo}
                                        onSelect={(value) =>
                                            handleChange("cargo", value)
                                        }
                                        options={CARGO_OPTIONS}
                                        placeholder="Selecione o Cargo"
                                        isOpen={dropdown.cargo}
                                        onToggle={() =>
                                            toggleDropdown("cargo")
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {tipo === "ENCARREGADO" && (
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                <label className={labelClass}>
                                    <Users className="h-4 w-4" />
                                    Observação
                                </label>

                                <input
                                    value={form.observacao}
                                    onChange={(event) =>
                                        handleChange(
                                            "observacao",
                                            event.target.value,
                                        )
                                    }
                                    className={`${inputClass} sm:col-span-3`}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 w-full rounded-xl border border-red-500/20 bg-red-500/15 px-6 text-sm font-semibold text-red-400 transition hover:bg-red-500/25 sm:w-auto"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-6 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {saving && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}

                            {saving
                                ? "Salvando..."
                                : isEdit
                                    ? "Salvar"
                                    : "Cadastrar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
