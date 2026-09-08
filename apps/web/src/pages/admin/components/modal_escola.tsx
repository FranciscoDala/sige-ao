import {
    useState,
    useRef,
    useEffect,
    FormEvent,
    useMemo,
    MouseEvent,
    ChangeEvent,
} from "react";
import {
    X,
    Upload,
    Loader2,
    Building2,
    Image as ImageIcon,
    MapPin,
    Phone,
    FileText,
    ChevronDown,
    GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

const NIVEIS_ENSINO = [
    { value: "PRIMARIO", label: "Primário - 1ª à 6ª" },
    { value: "I_CICLO", label: "I Ciclo - 7ª à 9ª" },
    { value: "II_CICLO", label: "II Ciclo - 10ª à 13ª" },
    { value: "COMPLEXO", label: "Complexo - 7ª à 13ª" },
    { value: "MEDIO_TECNICO", label: "Médio Técnico" },
    { value: "SUPERIOR", label: "Superior" },
];

const PROVINCIAS_ANGOLA = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando Cubango",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cunene",
    "Huambo",
    "Huíla",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Namibe",
    "Uíge",
    "Zaire",
];

const MUNICIPIOS_ANGOLA: Record<string, string[]> = {
    Luanda: [
        "Luanda",
        "Belas",
        "Cazenga",
        "Cacuaco",
        "Viana",
        "Talatona",
        "Kilamba Kiaxi",
        "Icolo e Bengo",
        "Quiçama",
    ],
    Bengo: ["Caxito", "Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
    Benguela: ["Benguela", "Baía Farta", "Balombo", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito"],
    "Lunda Sul": ["Saurimo", "Dala", "Cacolo", "Cassai Sul", "Muangueji", "Cassengo", "Luma Cassai", "Muconda"],
    Huambo: ["Huambo", "Bailundo", "Caála", "Ecunha", "Londuimbali", "Mungo", "Cachiungo"],
    Huíla: ["Lubango", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Matala"],
};

export interface Escola {
    id: string;
    id_curto: string;
    nome: string;
    sigla?: string | null;
    nif?: string | null;
    nivel_ensino:
    | "PRIMARIO"
    | "I_CICLO"
    | "II_CICLO"
    | "COMPLEXO"
    | "MEDIO_TECNICO"
    | "SUPERIOR";
    endereco?: string | null;
    telefone?: string | null;
    provincia?: string | null;
    municipio?: string | null;
    logo_url?: string | null;
    ativo: boolean;
    cor_primaria: string;
    cor_secundaria: string;
    tema: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (
        data: Partial<Escola> & { id_curto?: string },
        id?: string,
        logoFile?: File
    ) => Promise<void>;
    escola: Escola | null;
    saving: boolean;
}

type FormState = {
    nome: string;
    sigla: string;
    nif: string;
    nivel_ensino: Escola["nivel_ensino"];
    endereco: string;
    telefone: string;
    provincia: string;
    municipio: string;
};

const generateSigla = (nome: string) => {
    if (!nome.trim()) return "";
    const words = nome
        .split(/\s+/)
        .filter(
            (word) =>
                word.length > 2 &&
                !["da", "de", "do", "das", "dos", "e"].includes(word.toLowerCase())
        );

    return words
        .slice(0, 4)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 4);
};

export default function EscolaModal({ open, onClose, onSave, escola, saving }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const primeiraCarga = useRef(true);

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [form, setForm] = useState<FormState>({
        nome: "",
        sigla: "",
        nif: "",
        nivel_ensino: "PRIMARIO",
        endereco: "",
        telefone: "",
        provincia: "",
        municipio: "",
    });

    const [dropdownProv, setDropdownProv] = useState(false);
    const [dropdownMun, setDropdownMun] = useState(false);
    const [dropdownNivel, setDropdownNivel] = useState(false);

    const dropdownProvRef = useRef<HTMLDivElement>(null);
    const dropdownMunRef = useRef<HTMLDivElement>(null);
    const dropdownNivelRef = useRef<HTMLDivElement>(null);

    const municipios = useMemo(() => MUNICIPIOS_ANGOLA[form.provincia] || [], [form.provincia]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | Event) => {
            const target = event.target as Node;

            if (dropdownProvRef.current && !dropdownProvRef.current.contains(target)) {
                setDropdownProv(false);
            }
            if (dropdownMunRef.current && !dropdownMunRef.current.contains(target)) {
                setDropdownMun(false);
            }
            if (dropdownNivelRef.current && !dropdownNivelRef.current.contains(target)) {
                setDropdownNivel(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!form.nome.trim()) {
            setForm((prev) => ({ ...prev, sigla: "" }));
            return;
        }

        setForm((prev) => ({
            ...prev,
            sigla: generateSigla(prev.nome),
        }));
    }, [form.nome]);

    useEffect(() => {
        if (escola) {
            setForm({
                nome: escola.nome || "",
                sigla: escola.sigla || "",
                nif: escola.nif || "",
                nivel_ensino: escola.nivel_ensino || "PRIMARIO",
                endereco: escola.endereco || "",
                telefone: escola.telefone || "",
                provincia: escola.provincia || "",
                municipio: escola.municipio || "",
            });
            setLogoPreview(escola.logo_url || null);
            setLogoFile(null);
            primeiraCarga.current = true;
        } else {
            setForm({
                nome: "",
                sigla: "",
                nif: "",
                nivel_ensino: "PRIMARIO",
                endereco: "",
                telefone: "",
                provincia: "",
                municipio: "",
            });
            setLogoPreview(null);
            setLogoFile(null);
            primeiraCarga.current = true;
        }
    }, [escola, open]);

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

    if (!open) return null;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);

        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(String(reader.result));
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.nome.trim()) {
            toast.error("O nome da escola é obrigatório");
            return;
        }

        if (!form.provincia) {
            toast.error("Selecione a província");
            return;
        }

        if (!form.nivel_ensino) {
            toast.error("Selecione o nível de ensino");
            return;
        }

        const payload: Partial<Escola> & { id_curto: string } = {
            nome: form.nome,
            sigla: form.sigla || undefined,
            nif: form.nif || undefined,
            nivel_ensino: form.nivel_ensino,
            endereco: form.endereco || undefined,
            telefone: form.telefone || undefined,
            provincia: form.provincia,
            municipio: form.municipio || undefined,
            id_curto: escola ? escola.id_curto : `ESC${Date.now().toString().slice(-3)}`,
            cor_primaria: "#3B82F6",
            cor_secundaria: "#8B5CF6",
            tema: "escuro",
            ativo: true,
        };

        await onSave(payload, escola?.id, logoFile || undefined);
    };

    const handleChange = (field: keyof FormState, value: string) => {
        if (field === "provincia") {
            primeiraCarga.current = false;
            setForm((prev) => ({ ...prev, provincia: value, municipio: "" }));
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
        isObject = false,
    }: any) => {
        const selectedLabel = isObject
            ? options.find((o: any) => o.value === value)?.label || placeholder
            : value || placeholder;

        return (
            <div ref={refDiv} className="relative sm:col-span-3">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 text-left text-sm text-white transition hover:bg-white/10 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    <span className="truncate">{selectedLabel}</span>
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
    };

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
                                {escola ? "Editar Escola" : "Cadastrar Escola"}
                            </h2>
                            <p className="mt-1 text-xs text-gray-400">
                                {escola ? "Altere os dados abaixo" : "Preencha os dados da nova escola"}
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
                                <label className={labelClass}>Nome da Escola *</label>
                                <input
                                    value={form.nome}
                                    onChange={(e) => handleChange("nome", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="Escola Mutamba"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <GraduationCap className="h-4 w-4" />
                                    Nível de Ensino *
                                </label>
                                <CustomSelect
                                    refDiv={dropdownNivelRef}
                                    value={form.nivel_ensino}
                                    onSelect={(val: string) => handleChange("nivel_ensino", val)}
                                    options={NIVEIS_ENSINO}
                                    placeholder="Selecione o Nível"
                                    isOpen={dropdownNivel}
                                    setIsOpen={setDropdownNivel}
                                    isObject={true}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <FileText className="h-4 w-4" />
                                    Sigla
                                </label>
                                <input
                                    value={form.sigla}
                                    readOnly
                                    className={`${inputClass} cursor-not-allowed bg-white/5 sm:col-span-3`}
                                    placeholder="EM"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <FileText className="h-4 w-4" />
                                    NIF
                                </label>
                                <input
                                    value={form.nif}
                                    onChange={(e) => handleChange("nif", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="5000000"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <Phone className="h-4 w-4" />
                                    Telefone
                                </label>
                                <input
                                    value={form.telefone}
                                    onChange={(e) => handleChange("telefone", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="+244 923 000 000"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-start sm:gap-3">
                                <label className={`${labelClass} pt-2`}>
                                    <MapPin className="h-4 w-4" />
                                    Endereço
                                </label>
                                <input
                                    value={form.endereco}
                                    onChange={(e) => handleChange("endereco", e.target.value)}
                                    className={`${inputClass} sm:col-span-3`}
                                    placeholder="Rua, Bairro"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>Província *</label>
                                <CustomSelect
                                    refDiv={dropdownProvRef}
                                    value={form.provincia}
                                    onSelect={(val: string) => handleChange("provincia", val)}
                                    options={PROVINCIAS_ANGOLA}
                                    placeholder="Selecione a Província"
                                    isOpen={dropdownProv}
                                    setIsOpen={setDropdownProv}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>Município</label>
                                <CustomSelect
                                    refDiv={dropdownMunRef}
                                    value={form.municipio}
                                    onSelect={(val: string) => handleChange("municipio", val)}
                                    options={municipios}
                                    placeholder="Selecione o Município"
                                    disabled={!form.provincia}
                                    isOpen={dropdownMun}
                                    setIsOpen={setDropdownMun}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center sm:gap-3">
                                <label className={labelClass}>
                                    <ImageIcon className="h-4 w-4" />
                                    Logo
                                </label>

                                <div className="flex items-center gap-3 sm:col-span-3">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Preview da logo"
                                                className="h-full w-full rounded-xl object-cover"
                                            />
                                        ) : (
                                            <Upload className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            ref={fileRef}
                                            accept="image/*"
                                            className="hidden"
                                            id="logo-upload"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Enviar Logo
                                        </label>
                                    </div>
                                </div>
                            </div>
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
                            {saving ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
