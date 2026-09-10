import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type FormEvent,
    type RefObject,
} from "react";
import {
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    IdCard,
    Loader2,
    Mail,
    MapPin,
    Phone,
    User,
    Users,
    X,
    BookOpen,
    Briefcase,
    GraduationCap,
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

const TIPOS_VINCULO = [
    { value: "ALUNO", label: "Aluno" },
    { value: "PROFESSOR", label: "Professor" },
    { value: "FUNCIONARIO", label: "Funcionário" },
    { value: "ENCARREGADO", label: "Encarregado" },
];

const SEXO_OPTIONS = [
    { value: "MASCULINO", label: "Masculino" },
    { value: "FEMININO", label: "Feminino" },
];

const ESTADO_CIVIL_OPTIONS = [
    { value: "SOLTEIRO", label: "Solteiro" },
    { value: "CASADO", label: "Casado" },
    { value: "DIVORCIADO", label: "Divorciado" },
    { value: "VIUVO", label: "Viúvo" },
];

const CARGO_OPTIONS = [
    { value: "SECRETARIO", label: "Secretário" },
    { value: "DIRETOR_GERAL", label: "Diretor Geral" },
    { value: "PEDAGOGICO", label: "Pedagógico" },
    { value: "LIMPEZA", label: "Limpeza" },
    { value: "SEGURANCA", label: "Segurança" },
    { value: "OUTRO", label: "Outro" },
];

function getSavedTheme(): TemaConfig | null {
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

interface CalendarFieldProps {
    value: string;
    onChange: (value: string) => void;
    corPrimaria: string;
    corSecundaria: string;
    textPrimary: string;
    textSecondary: string;
    bgCard: string;
    borderCard: string;
}

function CalendarField({
    value,
    onChange,
    corPrimaria,
    corSecundaria,
    textPrimary,
    textSecondary,
    bgCard,
    borderCard,
}: CalendarFieldProps) {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const getInitialMonth = () => {
        if (!value) {
            const current = new Date();
            return new Date(current.getFullYear(), current.getMonth(), 1);
        }

        const [year, month] = value.split("-").map(Number);

        return new Date(year, month - 1, 1);
    };

    const [visibleMonth, setVisibleMonth] =
        useState<Date>(getInitialMonth);

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

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const selectedDate = value
        ? (() => {
              const [selectedYear, selectedMonth, selectedDay] =
                  value.split("-").map(Number);

              return new Date(
                  selectedYear,
                  selectedMonth - 1,
                  selectedDay,
              );
          })()
        : null;

    const today = new Date();

    const isSameDay = (first: Date, second: Date | null) =>
        Boolean(
            second &&
                first.getFullYear() === second.getFullYear() &&
                first.getMonth() === second.getMonth() &&
                first.getDate() === second.getDate(),
        );

    const formatDate = (date: Date) =>
        [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");

    const selectDate = (day: number) => {
        onChange(formatDate(new Date(year, month, day)));
        setOpen(false);
    };

    const days = Array.from(
        { length: firstDay + daysInMonth },
        (_, index) =>
            index < firstDay ? null : index - firstDay + 1,
    );

    const displayValue = value
        ? (() => {
              const [dateYear, dateMonth, dateDay] = value
                  .split("-")
                  .map(Number);

              return new Date(
                  dateYear,
                  dateMonth - 1,
                  dateDay,
              ).toLocaleDateString("pt-BR");
          })()
        : "Selecione a data";

    return (
        <div ref={calendarRef} className="relative sm:col-span-3">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-left text-base transition focus:outline-none focus:ring-2 sm:text-sm"
                style={{
                    backgroundColor: bgCard,
                    border: `1px solid ${borderCard}`,
                    color: value ? textPrimary : textSecondary,
                }}
            >
                <span>{displayValue}</span>

                <CalendarDays
                    className="h-4 w-4"
                    style={{ color: corPrimaria }}
                />
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full z-50 mt-2 w-full min-w-[280px] rounded-2xl p-3 shadow-2xl"
                    style={{
                        backgroundColor: bgCard,
                        border: `1px solid ${borderCard}`,
                    }}
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() =>
                                setVisibleMonth(
                                    new Date(year, month - 1, 1),
                                )
                            }
                            className="rounded-lg p-2 transition hover:bg-black/10"
                            aria-label="Mês anterior"
                        >
                            <ChevronLeft
                                className="h-4 w-4"
                                style={{ color: textPrimary }}
                            />
                        </button>

                        <span
                            className="text-sm font-semibold capitalize"
                            style={{ color: textPrimary }}
                        >
                            {visibleMonth.toLocaleDateString("pt-BR", {
                                month: "long",
                                year: "numeric",
                            })}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setVisibleMonth(
                                    new Date(year, month + 1, 1),
                                )
                            }
                            className="rounded-lg p-2 transition hover:bg-black/10"
                            aria-label="Próximo mês"
                        >
                            <ChevronRight
                                className="h-4 w-4"
                                style={{ color: textPrimary }}
                            />
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
                        {days.map((day, index) =>
                            day === null ? (
                                <span
                                    key={`empty-${index}`}
                                    className="h-8"
                                />
                            ) : (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => selectDate(day)}
                                    className="h-8 rounded-lg text-xs font-medium transition hover:scale-105"
                                    style={{
                                        color:
                                            isSameDay(
                                                new Date(year, month, day),
                                                selectedDate,
                                            )
                                                ? "#FFFFFF"
                                                : textPrimary,
                                        background:
                                            isSameDay(
                                                new Date(year, month, day),
                                                selectedDate,
                                            )
                                                ? `linear-gradient(135deg, ${corPrimaria}, ${corSecundaria})`
                                                : isSameDay(
                                                        new Date(
                                                            year,
                                                            month,
                                                            day,
                                                        ),
                                                        today,
                                                    )
                                                    ? `${corPrimaria}20`
                                                    : "transparent",
                                    }}
                                >
                                    {day}
                                </button>
                            ),
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            const current = new Date();
                            onChange(formatDate(current));
                            setVisibleMonth(
                                new Date(
                                    current.getFullYear(),
                                    current.getMonth(),
                                    1,
                                ),
                            );
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
    options: { value: string; label: string }[];
    placeholder: string;
    isOpen: boolean;
    textPrimary: string;
    textSecondary: string;
    bgCard: string;
    borderCard: string;
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
    bgCard,
    borderCard,
    corPrimaria,
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
                    backgroundColor: bgCard,
                    border: `1px solid ${borderCard}`,
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
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl shadow-2xl backdrop-blur-2xl"
                    style={{
                        backgroundColor: bgCard,
                        border: `1px solid ${borderCard}`,
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
                                        value === option.value
                                            ? corPrimaria
                                            : textPrimary,
                                    backgroundColor:
                                        value === option.value
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

    const tipo = form.tipo;
    const isEdit = Boolean(pessoa);

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
        const updateTheme = () => {
            setTema(getSavedTheme());
        };

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

            const inside = (
                Object.keys(refs) as DropdownKey[]
            ).some((key) => refs[key].current?.contains(target));

            if (!inside) {
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

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.addEventListener("keydown", handleKeyDown);
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
    const textSecondary = isClaro ? "#64748B" : "#9CA3AF";

    const bgCard = isClaro
        ? "rgba(0,0,0,0.03)"
        : "rgba(255,255,255,0.05)";

    const borderCard = isClaro
        ? "rgba(15,23,42,0.12)"
        : "rgba(255,255,255,0.12)";

    const estiloCard = tema?.estilo_card || "arredondado";

    const cardStyle: CSSProperties = {
        background:
            estiloCard === "glass"
                ? isClaro
                    ? "rgba(255,255,255,0.72)"
                    : "rgba(15,23,42,0.72)"
                : isClaro
                    ? "#FFFFFF"
                    : "#0F172A",
        borderStyle: "solid",
        borderColor:
            estiloCard === "borda_colorida"
                ? corPrimaria
                : borderCard,
        borderWidth:
            estiloCard === "borda_colorida" ? "2px" : "1px",
        borderRadius:
            estiloCard === "quadrado"
                ? "0"
                : estiloCard === "minimalista"
                    ? "0.5rem"
                    : "1rem",
        boxShadow:
            estiloCard === "elevado"
                ? "0 20px 25px -5px rgba(0,0,0,0.25)"
                : "0 25px 50px -12px rgba(0,0,0,0.35)",
        backdropFilter:
            estiloCard === "glass"
                ? "blur(20px) saturate(150%)"
                : undefined,
    };

    const inputStyle: CSSProperties = {
        backgroundColor: bgCard,
        border: `1px solid ${borderCard}`,
        color: textPrimary,
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

    const turmaOptions = turmas.map((turma) => ({
        value: turma.id,
        label: turma.nome,
    }));

    const renderField = (
        label: string,
        icon: React.ReactNode,
        field: keyof FormState,
        type = "text",
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
                value={String(form[field])}
                onChange={(event) =>
                    handleChange(field, event.target.value)
                }
                className={`${inputClass} sm:col-span-3`}
                style={inputStyle}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div
                className="flex max-h-[92vh] w-full max-w-[800px] flex-col overflow-hidden"
                style={cardStyle}
            >
                <div
                    className="shrink-0 border-b p-4"
                    style={{ borderColor: borderCard }}
                >
                    <div className="flex items-center justify-between">
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
                            className="rounded-lg p-1.5 transition hover:bg-black/10"
                            aria-label="Fechar modal"
                        >
                            <X
                                className="h-4 w-4"
                                style={{ color: textSecondary }}
                            />
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="modal-scrollbar-hide grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-4">
                        <h3
                            className="text-sm font-semibold"
                            style={{ color: corPrimaria }}
                        >
                            Dados Pessoais
                        </h3>

                        {renderField(
                            "Nome *",
                            <User
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "nome",
                        )}

                        {renderField(
                            "BI *",
                            <IdCard
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "bi",
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
                                bgCard={bgCard}
                                borderCard={borderCard}
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
                                bgCard={bgCard}
                                borderCard={borderCard}
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
                                bgCard={bgCard}
                                borderCard={borderCard}
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

                        {renderField(
                            "Telefone",
                            <Phone
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "telefone",
                        )}

                        {renderField(
                            "Email",
                            <Mail
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "email",
                            "email",
                        )}

                        {renderField(
                            "Endereço",
                            <MapPin
                                className="h-3.5 w-3.5"
                                style={{ color: corPrimaria }}
                            />,
                            "endereco",
                        )}

                        <div
                            className="my-2 border-t"
                            style={{ borderColor: borderCard }}
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
                                placeholder="Selecione o Tipo"
                                isOpen={dropdown.tipo}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                bgCard={bgCard}
                                borderCard={borderCard}
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
                                {renderField(
                                    "Nº Processo *",
                                    <BookOpen
                                        className="h-3.5 w-3.5"
                                        style={{
                                            color: corPrimaria,
                                        }}
                                    />,
                                    "numero_processo",
                                )}

                                <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
                                    <label
                                        className={labelClass}
                                        style={{ color: textPrimary }}
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
                                        placeholder="Selecione a Turma"
                                        isOpen={dropdown.turma}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                        bgCard={bgCard}
                                        borderCard={borderCard}
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
                                {renderField(
                                    "Formação *",
                                    <GraduationCap
                                        className="h-3.5 w-3.5"
                                        style={{
                                            color: corPrimaria,
                                        }}
                                    />,
                                    "formacao",
                                )}

                                {renderField(
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
                                {renderField(
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
                                        style={{ color: textPrimary }}
                                    >
                                        Cargo *
                                    </label>

                                    <CustomSelect
                                        refDiv={refs.cargo}
                                        value={form.cargo}
                                        options={CARGO_OPTIONS}
                                        placeholder="Selecione o Cargo"
                                        isOpen={dropdown.cargo}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                        bgCard={bgCard}
                                        borderCard={borderCard}
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
                            renderField(
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
                        style={{ borderColor: borderCard }}
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
