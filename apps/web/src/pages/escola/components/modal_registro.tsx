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

type DropdownKey =
    | "tipo"
    | "sexo"
    | "estado_civil"
    | "cargo"
    | "turma";

type DropdownState = Record<DropdownKey, boolean>;

interface Option {
    value: string;
    label: string;
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
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
}

function sameDay(first: Date, second: Date | null): boolean {
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
    corPrimaria: string;
    corSecundaria: string;
    textPrimary: string;
    textSecondary: string;
    bgInput: string;
    bgPopup: string;
    borderColor: string;
}

function CalendarField({
    value,
    onChange,
    corPrimaria,
    corSecundaria,
    textPrimary,
    textSecondary,
    bgInput,
    bgPopup,
    borderColor,
}: CalendarFieldProps) {
    const calendarRef = useRef<HTMLDivElement>(null);
    const selectedDate = parseDate(value);
    const initialDate = selectedDate || new Date();

    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(initialDate.getMonth());
    const [year, setYear] = useState(initialDate.getFullYear());

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
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

    const chooseDate = (day: number) => {
        onChange(formatDate(new Date(year, month, day)));
        setOpen(false);
    };

    const goPreviousMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear((current) => current - 1);
            return;
        }

        setMonth((current) => current - 1);
    };

    const goNextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear((current) => current + 1);
            return;
        }

        setMonth((current) => current + 1);
    };

    const goPreviousYear = () => {
        setYear((current) => current - 1);
    };

    const goNextYear = () => {
        setYear((current) => current + 1);
    };

    const today = new Date();

    return (
        <div ref={calendarRef} className="relative sm:col-span-3">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-base transition focus:outline-none focus:ring-2 sm:text-sm"
                style={{
                    backgroundColor: bgInput,
                    border: `1px solid ${borderColor}`,
                    color: value ? textPrimary : textSecondary,
                }}
            >
                <span>
                    {selectedDate
                        ? selectedDate.toLocaleDateString("pt-BR")
                        : "Selecione a data"}
                </span>

                <CalendarDays
                    className="h-4 w-4"
                    style={{ color: corPrimaria }}
                />
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full z-[100] mt-2 w-full min-w-[280px] rounded-2xl p-3 shadow-2xl"
                    style={{
                        backgroundColor: bgPopup,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    <div className="mb-3 flex items-center justify-between gap-1">
                        <button
                            type="button"
                            onClick={goPreviousYear}
                            className="rounded-lg px-2 py-1 text-xs transition hover:bg-black/10"
                            style={{ color: textSecondary }}
                        >
                            «
                        </button>

                        <button
                            type="button"
                            onClick={goPreviousMonth}
                            className="rounded-lg p-1.5 transition hover:bg-black/10"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                style={{ color: textPrimary }}
                            />
                        </button>

                        <span
                            className="flex-1 text-center text-sm font-semibold capitalize"
                            style={{ color: textPrimary }}
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
                            onClick={goNextMonth}
                            className="rounded-lg p-1.5 transition hover:bg-black/10"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight
                                className="h-4 w-4"
                                style={{ color: textPrimary }}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={goNextYear}
                            className="rounded-lg px-2 py-1 text-xs transition hover:bg-black/10"
                            style={{ color: textSecondary }}
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
                                    style={{ color: textSecondary }}
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
                            const isSelected = sameDay(
                                currentDate,
                                selectedDate,
                            );
                            const isToday = sameDay(currentDate, today);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => chooseDate(day)}
                                    className="h-8 rounded-lg text-xs font-medium transition hover:scale-105"
                                    style={{
                                        color: isSelected
                                            ? "#FFFFFF"
                                            : textPrimary,
                                        background: isSelected
                                            ? `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`
                                            : isToday
                                                ? `${corPrimaria}20`
                                                : "transparent",
                                        border:
                                            isToday && !isSelected
                                                ? `1px solid ${corPrimaria}`
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
                            const current = new Date();

                            onChange(formatDate(current));
                            setMonth(current.getMonth());
                            setYear(current.getFullYear());
                            setOpen(false);
                        }}
                        className="mt-3 w-full rounded-lg py-2 text-xs font-semibold transition hover:bg-black/10"
                        style={{ color: corPrimaria }}
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
    textPrimary: string;
    textSecondary: string;
    bgInput: string;
    bgPopup: string;
    borderColor: string;
    corPrimaria: string;
    onToggle: () => void;
    onSelect: (value: string) => void;
}

function CustomSelect({
    refDiv,
    value,
    options,
    placeholder,
    isOpen,
    textPrimary,
    textSecondary,
    bgInput,
    bgPopup,
    borderColor,
    corPrimaria,
    onToggle,
    onSelect,
}: CustomSelectProps) {
    const selected = options.find(
        (option) => option.value === value,
    );

    return (
        <div ref={refDiv} className="relative sm:col-span-3">
            <button
                type="button"
                onClick={onToggle}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-base transition focus:outline-none sm:text-sm"
                style={{
                    backgroundColor: bgInput,
                    border: `1px solid ${borderColor}`,
                    color: textPrimary,
                }}
            >
                <span className="truncate">
                    {selected?.label || placeholder}
                </span>

                <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                    style={{ color: textSecondary }}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute z-[100] mt-2 w-full overflow-hidden rounded-xl shadow-2xl"
                    style={{
                        backgroundColor: bgPopup,
                        border: `1px solid ${borderColor}`,
                    }}
                >
                    <div className="modal-scrollbar-hide max-h-48 overflow-y-auto py-1">
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
                                        option.value === value
                                            ? corPrimaria
                                            : textPrimary,
                                    backgroundColor:
                                        option.value === value
                                            ? `${corPrimaria}20`
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
}: Props) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [tema, setTema] = useState<TemaConfig | null>(null);
    const [dropdown, setDropdown] =
        useState<DropdownState>(INITIAL_DROPDOWN);

    const isEdit = Boolean(pessoa);
    const tipo = form.tipo;

    const refs: Record<
        DropdownKey,
        RefObject<HTMLDivElement | null>
    > = {
        tipo: useRef<HTMLDivElement>(null),
        sexo: useRef<HTMLDivElement>(null),
        estado_civil: useRef<HTMLDivElement>(null),
        cargo: useRef<HTMLDivElement>(null),
        turma: useRef<HTMLDivElement>(null),
    };

    useEffect(() => {
        const updateTheme = () => setTema(readTheme());

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
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            const clickedInside = (
                Object.keys(refs) as DropdownKey[]
            ).some((key) => refs[key].current?.contains(target));

            if (!clickedInside) {
                setDropdown(INITIAL_DROPDOWN);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
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

    const isClaro = tema?.tema === "claro";
    const corPrimaria = tema?.cor_primaria || "#3B82F6";
    const corSecundaria = tema?.cor_secundaria || "#8B5CF6";

    const textPrimary = isClaro ? "#1E293B" : "#FFFFFF";
    const textSecondary = isClaro ? "#64748B" : "#CBD5E1";

    const bgInput = isClaro
        ? "rgba(15,23,42,0.04)"
        : "rgba(255,255,255,0.08)";

    const bgPopup = isClaro ? "#FFFFFF" : "#172033";

    const borderColor = isClaro
        ? "rgba(15,23,42,0.16)"
        : "rgba(255,255,255,0.16)";

    const estiloCard = tema?.estilo_card || "arredondado";

    const modalStyle: CSSProperties = {
        backgroundColor: isClaro ? "#FFFFFF" : "#0F172A",
        border: `1px solid ${
            estiloCard === "borda_colorida"
                ? corPrimaria
                : borderColor
        }`,
        borderWidth: estiloCard === "borda_colorida" ? 2 : 1,
        borderRadius:
            estiloCard === "quadrado"
                ? "0"
                : estiloCard === "minimalista"
                    ? "0.5rem"
                    : "1rem",
        boxShadow:
            estiloCard === "elevado"
                ? "0 24px 60px rgba(0,0,0,0.4)"
                : "0 20px 50px rgba(0,0,0,0.35)",
    };

    const inputClass =
        "h-10 w-full rounded-xl px-3 text-base transition focus:outline-none focus:ring-2 sm:text-sm";

    const labelClass =
        "flex items-center gap-2 text-xs sm:justify-self-end";

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
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const escolaId =
        pessoa?.vinculos?.[0]?.escola_id || escolas[0]?.id;

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

        if (tipo === "ALUNO" && !form.numero_processo.trim()) {
            toast.error(
                "Nº de processo é obrigatório para aluno",
            );
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
        });
    };

    const inputStyle: CSSProperties = {
        backgroundColor: bgInput,
        border: `1px solid ${borderColor}`,
        color: textPrimary,
    };

    const turmaOptions = turmas.map((turma) => ({
        value: turma.id,
        label: turma.nome,
    }));

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
                style={{ color: textPrimary }}
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
                style={inputStyle}
                required={required}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-4">
            <div
                className="flex max-h-[92vh] w-full max-w-[500px] flex-col overflow-hidden"
                style={modalStyle}
            >
                <div
                    className="flex shrink-0 items-center justify-between border-b p-4"
                    style={{ borderColor }}
                >
                    <div>
                        <h2
                            className="text-base font-bold"
                            style={{ color: textPrimary }}
                        >
                            {isEdit
                                ? "Editar Registro"
                                : "Cadastrar Registro"}
                        </h2>

                        <p
                            className="mt-1 text-xs"
                            style={{ color: textSecondary }}
                        >
                            Preencha os dados do registro
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
                            style={{ color: textSecondary }}
                        />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="modal-scrollbar-hide min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        <h3
                            className="text-sm font-semibold"
                            style={{ color: corPrimaria }}
                        >
                            Dados Pessoais
                        </h3>

                        {renderInput(
                            "Nome *",
                            <User
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "nome",
                            "text",
                            true,
                        )}

                        {renderInput(
                            "BI *",
                            <IdCard
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "bi",
                            "text",
                            true,
                        )}

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: textPrimary }}
                            >
                                <CalendarDays
                                    className="h-3.5 w-3.5"
                                    style={{ color: corPrimaria }}
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
                                corPrimaria={corPrimaria}
                                corSecundaria={corSecundaria}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                bgInput={bgInput}
                                bgPopup={bgPopup}
                                borderColor={borderColor}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: textPrimary }}
                            >
                                Sexo
                            </label>

                            <CustomSelect
                                refDiv={refs.sexo}
                                value={form.sexo}
                                options={SEXO_OPTIONS}
                                placeholder="Selecione"
                                isOpen={dropdown.sexo}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                bgInput={bgInput}
                                bgPopup={bgPopup}
                                borderColor={borderColor}
                                corPrimaria={corPrimaria}
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
                                style={{ color: textPrimary }}
                            >
                                Estado Civil
                            </label>

                            <CustomSelect
                                refDiv={refs.estado_civil}
                                value={form.estado_civil}
                                options={ESTADO_CIVIL_OPTIONS}
                                placeholder="Selecione"
                                isOpen={dropdown.estado_civil}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                bgInput={bgInput}
                                bgPopup={bgPopup}
                                borderColor={borderColor}
                                corPrimaria={corPrimaria}
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
                                style={{ color: corPrimaria }}
                            />,
                            "telefone",
                        )}

                        {renderInput(
                            "Email",
                            <Mail
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "email",
                            "email",
                        )}

                        {renderInput(
                            "Endereço",
                            <MapPin
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "endereco",
                        )}

                        <div
                            className="my-2 border-t"
                            style={{ borderColor }}
                        />

                        <h3
                            className="text-sm font-semibold"
                            style={{ color: corPrimaria }}
                        >
                            Vínculo com a Escola
                        </h3>

                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                            <label
                                className={labelClass}
                                style={{ color: textPrimary }}
                            >
                                Tipo *
                            </label>

                            <CustomSelect
                                refDiv={refs.tipo}
                                value={form.tipo}
                                options={TIPOS_VINCULO}
                                placeholder="Selecione o tipo"
                                isOpen={dropdown.tipo}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                bgInput={bgInput}
                                bgPopup={bgPopup}
                                borderColor={borderColor}
                                corPrimaria={corPrimaria}
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
                                        style={{
                                            color: corPrimaria,
                                        }}
                                    />,
                                    "numero_processo",
                                    "text",
                                    true,
                                )}

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label
                                        className={labelClass}
                                        style={{
                                            color: textPrimary,
                                        }}
                                    >
                                        <Users
                                            className="h-3.5 w-3.5"
                                            style={{
                                                color: corPrimaria,
                                            }}
                                        />
                                        Turma
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.turma}
                                        value={form.turma_id}
                                        options={turmaOptions}
                                        placeholder="Selecione a turma"
                                        isOpen={dropdown.turma}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                        bgInput={bgInput}
                                        bgPopup={bgPopup}
                                        borderColor={borderColor}
                                        corPrimaria={corPrimaria}
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
                                        style={{
                                            color: corPrimaria,
                                        }}
                                    />,
                                    "formacao",
                                    "text",
                                    true,
                                )}

                                {renderInput(
                                    "Disciplinas",
                                    <BookOpen
                                        className="h-3.5 w-3.5"
                                        style={{
                                            color: corPrimaria,
                                        }}
                                    />,
                                    "disciplinas",
                                )}
                            </>
                        )}

                        {tipo === "FUNCIONARIO" && (
                            <>
                                {renderInput(
                                    "Nº Funcional",
                                    <Briefcase
                                        className="h-3.5 w-3.5"
                                        style={{
                                            color: corPrimaria,
                                        }}
                                    />,
                                    "numero_funcional",
                                )}

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label
                                        className={labelClass}
                                        style={{
                                            color: textPrimary,
                                        }}
                                    >
                                        Cargo *
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.cargo}
                                        value={form.cargo}
                                        options={CARGO_OPTIONS}
                                        placeholder="Selecione o cargo"
                                        isOpen={dropdown.cargo}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                        bgInput={bgInput}
                                        bgPopup={bgPopup}
                                        borderColor={borderColor}
                                        corPrimaria={corPrimaria}
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
                                    style={{ color: corPrimaria }}
                                />,
                                "observacao",
                            )}
                    </div>

                    <div
                        className="flex shrink-0 flex-col gap-3 border-t p-4 sm:flex-row sm:justify-end"
                        style={{ borderColor }}
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
                                background: `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`,
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
                    .modal-scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .modal-scrollbar-hide::-webkit-scrollbar {
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
