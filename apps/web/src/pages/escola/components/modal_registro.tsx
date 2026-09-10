import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type FormEvent,
    type ReactNode,
    type RefObject,
} from "react";
import {
    BookOpen,
    Briefcase,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    IdCard,
    Loader2,
    Mail,
    MapPin,
    Phone,
    User,
    Users,
    X,
} from "lucide-react";
import { toast } from "sonner";

export type NivelEnsino =
    | "PRIMARIO"
    | "I_CICLO"
    | "II_CICLO"
    | "COMPLEXO"
    | "MEDIO_TECNICO"
    | "SUPERIOR";

interface Escola {
    id: string;
    nome: string;
}

interface Turma {
    id: string;
    nome: string;
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
    nivelEnsino: NivelEnsino;
}

interface TemaConfig {
    tema?: "claro" | "escuro";
    cor_primaria?: string;
    cor_secundaria?: string;
    cor_fundo?: string;
    estilo_card?: string;
}

interface FormState {
    nome: string;
    bi: string;
    data_nascimento: string;
    sexo: string;
    estado_civil: string;
    telefone: string;
    email: string;
    endereco: string;
    tipo: string;
    numero_funcional: string;
    cargo: string;
    formacao: string;
    disciplinas: string;
    numero_processo: string;
    turma_id: string;
    observacao: string;
}

interface Option {
    value: string;
    label: string;
}

type DropdownKey =
    | "tipo"
    | "sexo"
    | "estado_civil"
    | "cargo"
    | "turma";

type DropdownState = Record<DropdownKey, boolean>;

const INITIAL_FORM: FormState = {
    nome: "",
    bi: "",
    data_nascimento: "",
    sexo: "",
    estado_civil: "",
    telefone: "",
    email: "",
    endereco: "",
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
    estado_civil: false,
    cargo: false,
    turma: false,
};

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

function readTheme(): TemaConfig | null {
    const saved = localStorage.getItem("escola_tema");

    if (!saved) {
        return null;
    }

    try {
        return JSON.parse(saved) as TemaConfig;
    } catch {
        return null;
    }
}

function formatDate(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function parseDate(value: string): Date | null {
    const parts = value.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return null;
    }

    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isSameDay(first: Date, second: Date | null): boolean {
    return Boolean(
        second &&
            first.getFullYear() === second.getFullYear() &&
            first.getMonth() === second.getMonth() &&
            first.getDate() === second.getDate(),
    );
}

interface CalendarFieldProps {
    value: string;
    onChange: (value: string) => void;
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    inputBackground: string;
    popupBackground: string;
    border: string;
}

function CalendarField({
    value,
    onChange,
    primary,
    secondary,
    text,
    muted,
    inputBackground,
    popupBackground,
    border,
}: CalendarFieldProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedDate = parseDate(value);
    const initialDate = selectedDate || new Date();

    const [isOpen, setIsOpen] = useState(false);
    const [month, setMonth] = useState(initialDate.getMonth());
    const [year, setYear] = useState(initialDate.getFullYear());

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, []);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from(
        { length: firstDay + daysInMonth },
        (_, index) =>
            index < firstDay ? null : index - firstDay + 1,
    );

    const moveMonth = (amount: number) => {
        const next = new Date(year, month + amount, 1);
        setMonth(next.getMonth());
        setYear(next.getFullYear());
    };

    const moveYear = (amount: number) => {
        setYear((current) => current + amount);
    };

    const chooseDate = (day: number) => {
        onChange(formatDate(new Date(year, month, day)));
        setIsOpen(false);
    };

    const today = new Date();

    return (
        <div ref={containerRef} className="relative sm:col-span-3">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-base transition focus:outline-none focus:ring-2 sm:text-sm"
                style={{
                    backgroundColor: inputBackground,
                    border: `1px solid ${border}`,
                    color: selectedDate ? text : muted,
                }}
            >
                <span>
                    {selectedDate
                        ? selectedDate.toLocaleDateString("pt-BR")
                        : "Selecione a data"}
                </span>

                <CalendarDays
                    className="h-4 w-4"
                    style={{ color: primary }}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 top-full z-[100] mt-2 w-full min-w-[280px] rounded-2xl p-3 shadow-2xl"
                    style={{
                        backgroundColor: popupBackground,
                        border: `1px solid ${border}`,
                    }}
                >
                    <div className="mb-3 flex items-center justify-between gap-1">
                        <button
                            type="button"
                            onClick={() => moveYear(-1)}
                            className="rounded-lg px-2 py-1 text-xs transition hover:bg-black/10"
                            style={{ color: muted }}
                        >
                            «
                        </button>

                        <button
                            type="button"
                            onClick={() => moveMonth(-1)}
                            className="rounded-lg p-1.5 transition hover:bg-black/10"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                style={{ color: text }}
                            />
                        </button>

                        <span
                            className="flex-1 text-center text-sm font-semibold capitalize"
                            style={{ color: text }}
                        >
                            {new Date(year, month, 1).toLocaleDateString(
                                "pt-BR",
                                {
                                    month: "long",
                                    year: "numeric",
                                },
                            )}
                        </span>

                        <button
                            type="button"
                            onClick={() => moveMonth(1)}
                            className="rounded-lg p-1.5 transition hover:bg-black/10"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight
                                className="h-4 w-4"
                                style={{ color: text }}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() => moveYear(1)}
                            className="rounded-lg px-2 py-1 text-xs transition hover:bg-black/10"
                            style={{ color: muted }}
                        >
                            »
                        </button>
                    </div>

                    <div className="mb-2 grid grid-cols-7 text-center">
                        {["D", "S", "T", "Q", "Q", "S", "S"].map(
                            (day, index) => (
                                <span
                                    key={`${day}-${index}`}
                                    className="py-1 text-[11px] font-semibold"
                                    style={{ color: muted }}
                                >
                                    {day}
                                </span>
                            ),
                        )}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (day === null) {
                                return (
                                    <span
                                        key={`empty-${index}`}
                                        className="h-8"
                                    />
                                );
                            }

                            const currentDate = new Date(year, month, day);
                            const selected = isSameDay(
                                currentDate,
                                selectedDate,
                            );
                            const isToday = isSameDay(
                                currentDate,
                                today,
                            );

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => chooseDate(day)}
                                    className="h-8 rounded-lg text-xs font-medium transition hover:scale-105"
                                    style={{
                                        color: selected ? "#FFFFFF" : text,
                                        background: selected
                                            ? `linear-gradient(135deg, ${primary}, ${secondary})`
                                            : isToday
                                                ? `${primary}20`
                                                : "transparent",
                                        border:
                                            isToday && !selected
                                                ? `1px solid ${primary}`
                                                : "1px solid transparent",
                                    }}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            onChange(formatDate(today));
                            setMonth(today.getMonth());
                            setYear(today.getFullYear());
                            setIsOpen(false);
                        }}
                        className="mt-3 w-full rounded-lg py-2 text-xs font-semibold transition hover:bg-black/10"
                        style={{ color: primary }}
                    >
                        Hoje
                    </button>
                </div>
            )}
        </div>
    );
}

interface CustomSelectProps {
    refDiv: RefObject<HTMLDivElement | null>;
    value: string;
    options: Option[];
    placeholder: string;
    isOpen: boolean;
    primary: string;
    text: string;
    muted: string;
    inputBackground: string;
    popupBackground: string;
    border: string;
    onToggle: () => void;
    onSelect: (value: string) => void;
}

function CustomSelect({
    refDiv,
    value,
    options,
    placeholder,
    isOpen,
    primary,
    text,
    muted,
    inputBackground,
    popupBackground,
    border,
    onToggle,
    onSelect,
}: CustomSelectProps) {
    const selected = options.find((option) => option.value === value);

    return (
        <div ref={refDiv} className="relative sm:col-span-3">
            <button
                type="button"
                onClick={onToggle}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-base transition focus:outline-none sm:text-sm"
                style={{
                    backgroundColor: inputBackground,
                    border: `1px solid ${border}`,
                    color: text,
                }}
            >
                <span className="truncate">
                    {selected?.label || placeholder}
                </span>

                <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    style={{ color: muted }}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute z-[100] mt-2 w-full overflow-hidden rounded-xl shadow-2xl"
                    style={{
                        backgroundColor: popupBackground,
                        border: `1px solid ${border}`,
                    }}
                >
                    <div className="registro-scrollbar-hide max-h-48 overflow-y-auto py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onSelect(option.value);
                                    onToggle();
                                }}
                                className="flex w-full px-3 py-2.5 text-left text-sm transition hover:bg-black/10"
                                style={{
                                    color:
                                        value === option.value
                                            ? primary
                                            : text,
                                    backgroundColor:
                                        value === option.value
                                            ? `${primary}20`
                                            : "transparent",
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
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
    nivelEnsino,
}: Props) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [theme, setTheme] = useState<TemaConfig | null>(null);
    const [dropdown, setDropdown] =
        useState<DropdownState>(INITIAL_DROPDOWN);

    const tipo = form.tipo;
    const isEdit = Boolean(pessoa);

    const professorUsaTurma = nivelEnsino === "PRIMARIO";
    const professorUsaDisciplinas = !professorUsaTurma;

    const tipoRef = useRef<HTMLDivElement>(null);
    const sexoRef = useRef<HTMLDivElement>(null);
    const estadoCivilRef = useRef<HTMLDivElement>(null);
    const cargoRef = useRef<HTMLDivElement>(null);
    const turmaRef = useRef<HTMLDivElement>(null);

    const refs: Record<
        DropdownKey,
        RefObject<HTMLDivElement | null>
    > = {
        tipo: tipoRef,
        sexo: sexoRef,
        estado_civil: estadoCivilRef,
        cargo: cargoRef,
        turma: turmaRef,
    };

    useEffect(() => {
        const updateTheme = () => setTheme(readTheme());

        updateTheme();
        window.addEventListener("escola-tema-updated", updateTheme);

        return () => {
            window.removeEventListener(
                "escola-tema-updated",
                updateTheme,
            );
        };
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            const clickedInside = (
                Object.keys(refs) as DropdownKey[]
            ).some((key) => refs[key].current?.contains(target));

            if (!clickedInside) {
                setDropdown(INITIAL_DROPDOWN);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, []);

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

    const isClaro = theme?.tema === "claro";
    const primary = theme?.cor_primaria || "#3B82F6";
    const secondary = theme?.cor_secundaria || "#8B5CF6";

    const text = isClaro ? "#1E293B" : "#FFFFFF";
    const muted = isClaro ? "#64748B" : "#CBD5E1";

    const inputBackground = isClaro
        ? "rgba(15,23,42,0.04)"
        : "rgba(255,255,255,0.08)";

    const popupBackground = isClaro ? "#FFFFFF" : "#172033";

    const border = isClaro
        ? "rgba(15,23,42,0.16)"
        : "rgba(255,255,255,0.16)";

    const cardStyle: CSSProperties = {
        backgroundColor: isClaro ? "#FFFFFF" : "#0F172A",
        border: `1px solid ${
            theme?.estilo_card === "borda_colorida"
                ? primary
                : border
        }`,
        borderWidth:
            theme?.estilo_card === "borda_colorida" ? 2 : 1,
        borderRadius:
            theme?.estilo_card === "quadrado"
                ? "0"
                : theme?.estilo_card === "minimalista"
                    ? "0.5rem"
                    : "1rem",
        boxShadow:
            theme?.estilo_card === "elevado"
                ? "0 24px 60px rgba(0,0,0,0.4)"
                : "0 20px 50px rgba(0,0,0,0.35)",
    };

    const inputClass =
        "h-10 w-full rounded-xl px-3 text-base transition focus:outline-none focus:ring-2 sm:text-sm";

    const labelClass =
        "flex items-center gap-2 text-xs sm:justify-self-end";

    const turmaOptions = turmas.map((turma) => ({
        value: turma.id,
        label: turma.nome,
    }));

    const escolaId =
        pessoa?.vinculos?.[0]?.escola_id || escolas[0]?.id;

    const toggleDropdown = (key: DropdownKey) => {
        setDropdown((current) => ({
            ...current,
            [key]: !current[key],
        }));
    };

    const handleChange = (
        field: keyof FormState,
        value: string,
    ) => {
        setForm((current) => {
            const next = {
                ...current,
                [field]: value,
            };

            if (field === "tipo") {
                next.numero_funcional = "";
                next.cargo = "";
                next.formacao = "";
                next.disciplinas = "";
                next.numero_processo = "";
                next.turma_id = "";
                next.observacao = "";
            }

            return next;
        });
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

        if (!escolaId) {
            toast.error("Escola não identificada");
            return;
        }

        if (tipo === "ALUNO") {
            if (!form.numero_processo.trim()) {
                toast.error(
                    "Nº de processo é obrigatório para aluno.",
                );
                return;
            }

            if (!form.turma_id) {
                toast.error("Selecione a turma do aluno.");
                return;
            }
        }

        if (tipo === "PROFESSOR") {
            if (!form.formacao.trim()) {
                toast.error(
                    "Formação é obrigatória para professor.",
                );
                return;
            }

            if (professorUsaTurma && !form.turma_id) {
                toast.error(
                    "Selecione a turma que o professor irá lecionar.",
                );
                return;
            }

            if (
                professorUsaDisciplinas &&
                !form.disciplinas.trim()
            ) {
                toast.error(
                    "Informe as disciplinas do professor.",
                );
                return;
            }
        }

        if (tipo === "FUNCIONARIO" && !form.cargo) {
            toast.error("Cargo é obrigatório para funcionário.");
            return;
        }

        await onSave({
            nome,
            bi,
            data_nascimento: form.data_nascimento || null,
            sexo: form.sexo || null,
            estado_civil: form.estado_civil || null,
            telefone: form.telefone.trim() || null,
            email: form.email.trim() || null,
            endereco: form.endereco.trim() || null,
            escola_id: escolaId,
            tipo,
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
                tipo === "PROFESSOR" && professorUsaDisciplinas
                    ? form.disciplinas.trim() || null
                    : null,
            numero_processo:
                tipo === "ALUNO"
                    ? form.numero_processo.trim() || null
                    : null,
            turma_id:
                tipo === "ALUNO" ||
                (tipo === "PROFESSOR" && professorUsaTurma)
                    ? form.turma_id || null
                    : null,
            observacao: form.observacao.trim() || null,
        });
    };

    const renderInput = (
        label: string,
        icon: ReactNode,
        field: keyof FormState,
        type = "text",
        required = false,
    ) => (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
            <label
                className={labelClass}
                style={{ color: text }}
            >
                {icon}
                {label}
            </label>

            <input
                type={type}
                value={form[field]}
                onChange={(event) =>
                    handleChange(field, event.target.value)
                }
                className={`${inputClass} sm:col-span-3`}
                style={{
                    backgroundColor: inputBackground,
                    border: `1px solid ${border}`,
                    color: text,
                }}
                required={required}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-4">
            <div
                className="flex max-h-[92vh] w-full max-w-[500px] flex-col overflow-hidden"
                style={cardStyle}
            >
                <div
                    className="flex shrink-0 items-center justify-between border-b p-4"
                    style={{ borderColor: border }}
                >
                    <div>
                        <h2
                            className="text-base font-bold"
                            style={{ color: text }}
                        >
                            {isEdit
                                ? "Editar Registro"
                                : "Cadastrar Registro"}
                        </h2>

                        <p
                            className="mt-1 text-xs"
                            style={{ color: muted }}
                        >
                            {nivelEnsino === "PRIMARIO"
                                ? "Ensino Primário"
                                : nivelEnsino.replace(/_/g, " ")}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modal"
                        className="rounded-lg p-1.5 transition hover:bg-black/10"
                    >
                        <X
                            className="h-4 w-4"
                            style={{ color: muted }}
                        />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="registro-scrollbar-hide min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        <h3
                            className="text-sm font-semibold"
                            style={{ color: primary }}
                        >
                            Dados Pessoais
                        </h3>

                        {renderInput(
                            "Nome *",
                            <User
                                className="h-3.5 w-3.5"
                                style={{ color: primary }}
                            />,
                            "nome",
                            "text",
                            true,
                        )}

                        {renderInput(
                            "BI *",
                            <IdCard
                                className="h-3.5 w-3.5"
                                style={{ color: primary }}
                            />,
                            "bi",
                            "text",
                            true,
                        )}

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: text }}
                            >
                                <CalendarDays
                                    className="h-3.5 w-3.5"
                                    style={{ color: primary }}
                                />
                                Data Nasc.
                            </label>

                            <CalendarField
                                value={form.data_nascimento}
                                onChange={(value) =>
                                    handleChange(
                                        "data_nascimento",
                                        value,
                                    )
                                }
                                primary={primary}
                                secondary={secondary}
                                text={text}
                                muted={muted}
                                inputBackground={inputBackground}
                                popupBackground={popupBackground}
                                border={border}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: text }}
                            >
                                Sexo
                            </label>

                            <CustomSelect
                                refDiv={refs.sexo}
                                value={form.sexo}
                                options={SEXO_OPTIONS}
                                placeholder="Selecione"
                                isOpen={dropdown.sexo}
                                primary={primary}
                                text={text}
                                muted={muted}
                                inputBackground={inputBackground}
                                popupBackground={popupBackground}
                                border={border}
                                onToggle={() =>
                                    toggleDropdown("sexo")
                                }
                                onSelect={(value) =>
                                    handleChange("sexo", value)
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: text }}
                            >
                                Estado Civil
                            </label>

                            <CustomSelect
                                refDiv={refs.estado_civil}
                                value={form.estado_civil}
                                options={ESTADO_CIVIL_OPTIONS}
                                placeholder="Selecione"
                                isOpen={dropdown.estado_civil}
                                primary={primary}
                                text={text}
                                muted={muted}
                                inputBackground={inputBackground}
                                popupBackground={popupBackground}
                                border={border}
                                onToggle={() =>
                                    toggleDropdown("estado_civil")
                                }
                                onSelect={(value) =>
                                    handleChange(
                                        "estado_civil",
                                        value,
                                    )
                                }
                            />
                        </div>

                        {renderInput(
                            "Telefone",
                            <Phone
                                className="h-3.5 w-3.5"
                                style={{ color: primary }}
                            />,
                            "telefone",
                        )}

                        {renderInput(
                            "Email",
                            <Mail
                                className="h-3.5 w-3.5"
                                style={{ color: primary }}
                            />,
                            "email",
                            "email",
                        )}

                        {renderInput(
                            "Endereço",
                            <MapPin
                                className="h-3.5 w-3.5"
                                style={{ color: primary }}
                            />,
                            "endereco",
                        )}

                        <div
                            className="my-2 border-t"
                            style={{ borderColor: border }}
                        />

                        <h3
                            className="text-sm font-semibold"
                            style={{ color: primary }}
                        >
                            Vínculo com a Escola
                        </h3>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: text }}
                            >
                                Tipo *
                            </label>

                            <CustomSelect
                                refDiv={refs.tipo}
                                value={form.tipo}
                                options={TIPOS_VINCULO}
                                placeholder="Selecione o tipo"
                                isOpen={dropdown.tipo}
                                primary={primary}
                                text={text}
                                muted={muted}
                                inputBackground={inputBackground}
                                popupBackground={popupBackground}
                                border={border}
                                onToggle={() =>
                                    toggleDropdown("tipo")
                                }
                                onSelect={(value) =>
                                    handleChange("tipo", value)
                                }
                            />
                        </div>

                        {tipo === "ALUNO" && (
                            <>
                                {renderInput(
                                    "Nº Processo *",
                                    <BookOpen
                                        className="h-3.5 w-3.5"
                                        style={{ color: primary }}
                                    />,
                                    "numero_processo",
                                    "text",
                                    true,
                                )}

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label
                                        className={labelClass}
                                        style={{ color: text }}
                                    >
                                        <Users
                                            className="h-3.5 w-3.5"
                                            style={{ color: primary }}
                                        />
                                        Turma *
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.turma}
                                        value={form.turma_id}
                                        options={turmaOptions}
                                        placeholder="Selecione a turma"
                                        isOpen={dropdown.turma}
                                        primary={primary}
                                        text={text}
                                        muted={muted}
                                        inputBackground={inputBackground}
                                        popupBackground={popupBackground}
                                        border={border}
                                        onToggle={() =>
                                            toggleDropdown("turma")
                                        }
                                        onSelect={(value) =>
                                            handleChange(
                                                "turma_id",
                                                value,
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {tipo === "PROFESSOR" && (
                            <>
                                {renderInput(
                                    "Formação *",
                                    <GraduationCap
                                        className="h-3.5 w-3.5"
                                        style={{ color: primary }}
                                    />,
                                    "formacao",
                                    "text",
                                    true,
                                )}

                                {professorUsaTurma ? (
                                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                        <label
                                            className={labelClass}
                                            style={{ color: text }}
                                        >
                                            <Users
                                                className="h-3.5 w-3.5"
                                                style={{
                                                    color: primary,
                                                }}
                                            />
                                            Turma *
                                        </label>

                                        <CustomSelect
                                            refDiv={refs.turma}
                                            value={form.turma_id}
                                            options={turmaOptions}
                                            placeholder="Selecione a turma"
                                            isOpen={dropdown.turma}
                                            primary={primary}
                                            text={text}
                                            muted={muted}
                                            inputBackground={inputBackground}
                                            popupBackground={popupBackground}
                                            border={border}
                                            onToggle={() =>
                                                toggleDropdown("turma")
                                            }
                                            onSelect={(value) =>
                                                handleChange(
                                                    "turma_id",
                                                    value,
                                                )
                                            }
                                        />
                                    </div>
                                ) : (
                                    renderInput(
                                        "Disciplinas *",
                                        <BookOpen
                                            className="h-3.5 w-3.5"
                                            style={{
                                                color: primary,
                                            }}
                                        />,
                                        "disciplinas",
                                        "text",
                                        true,
                                    )
                                )}
                            </>
                        )}

                        {tipo === "FUNCIONARIO" && (
                            <>
                                {renderInput(
                                    "Nº Funcional",
                                    <Briefcase
                                        className="h-3.5 w-3.5"
                                        style={{ color: primary }}
                                    />,
                                    "numero_funcional",
                                )}

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label
                                        className={labelClass}
                                        style={{ color: text }}
                                    >
                                        Cargo *
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.cargo}
                                        value={form.cargo}
                                        options={CARGO_OPTIONS}
                                        placeholder="Selecione o cargo"
                                        isOpen={dropdown.cargo}
                                        primary={primary}
                                        text={text}
                                        muted={muted}
                                        inputBackground={inputBackground}
                                        popupBackground={popupBackground}
                                        border={border}
                                        onToggle={() =>
                                            toggleDropdown("cargo")
                                        }
                                        onSelect={(value) =>
                                            handleChange(
                                                "cargo",
                                                value,
                                            )
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {tipo === "ENCARREGADO" &&
                            renderInput(
                                "Observação",
                                <Users
                                    className="h-3.5 w-3.5"
                                    style={{ color: primary }}
                                />,
                                "observacao",
                            )}
                    </div>

                    <div
                        className="flex shrink-0 flex-col gap-3 border-t p-4 sm:flex-row sm:justify-end"
                        style={{ borderColor: border }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 w-full rounded-xl border px-6 text-sm font-semibold transition hover:opacity-80 sm:w-auto"
                            style={{
                                color: isClaro
                                    ? "#DC2626"
                                    : "#F87171",
                                borderColor: isClaro
                                    ? "rgba(220,38,38,0.25)"
                                    : "rgba(248,113,113,0.25)",
                                backgroundColor: isClaro
                                    ? "rgba(220,38,38,0.08)"
                                    : "rgba(248,113,113,0.12)",
                            }}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            style={{
                                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                            }}
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

            <style>
                {`
                    .registro-scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .registro-scrollbar-hide::-webkit-scrollbar {
                        display: none;
                        width: 0;
                        height: 0;
                    }

                    @media (max-width: 640px) {
                        input,
                        select,
                        textarea {
                            font-size: 16px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}
