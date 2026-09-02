$root = "sige-ao"

$folders = @(
"apps/api/app/api","apps/api/app/core","apps/api/app/db","apps/api/app/models","apps/api/app/schemas","apps/api/app/services","apps/api/app/integrations","apps/api/tests",
"apps/web/src/components","apps/web/src/pages","apps/web/src/app","apps/web/src/api","apps/web/public",
"apps/site-escola/src/app","apps/site-escola/src/components", # site público de cada escola
"packages/ui","packages/tsconfig","packages/eslint-config","packages/db",
"infra","docs",".github/workflows"
)

$files = @(
"apps/api/app/main.py","apps/api/app/__init__.py",
"apps/api/app/api/v1_auth.py","apps/api/app/api/v1_escola.py","apps/api/app/api/v1_aluno.py","apps/api/app/api/v1_professor.py","apps/api/app/api/v1_turma.py","apps/api/app/api/v1_nota.py",
"apps/api/app/core/config.py","apps/api/app/core/security.py","apps/api/app/db/session.py","apps/api/app/db/base.py",
"apps/api/app/models/escola.py","apps/api/app/models/usuario.py","apps/api/app/models/aluno.py","apps/api/app/models/professor.py","apps/api/app/models/turma.py","apps/api/app/models/nota.py",
"apps/api/app/schemas/escola_schema.py","apps/api/app/schemas/usuario_schema.py","apps/api/app/schemas/aluno_schema.py",
"apps/api/app/services/escola_service.py","apps/api/app/services/auth_service.py",
"apps/api/app/integrations/email.py","apps/api/tests/test_auth.py","apps/api/alembic.ini","apps/api/Dockerfile","apps/api/pyproject.toml",
"apps/web/src/main.tsx","apps/web/src/app/layout.tsx","apps/web/src/app/login/page.tsx","apps/web/src/app/dashboard/page.tsx","apps/web/src/components/Header.tsx","apps/web/src/api/client.ts",
"apps/web/package.json","apps/web/next.config.js",
"apps/site-escola/src/app/[slug]/page.tsx","apps/site-escola/src/app/[slug]/layout.tsx","apps/site-escola/package.json", # [slug] pega mutamba.sige-ao.ao
"packages/ui/index.ts","packages/tsconfig/base.json","packages/eslint-config/index.js","packages/db/index.ts",
"infra/docker-compose.yml","infra/render.yaml",
"docs/API.md","docs/ONBOARDING.md",".github/workflows/deploy.yml",".gitignore","package.json","pnpm-workspace.yaml","README.md",".env.example"
)

# Criar pastas
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path "$root/$folder" | Out-Null
}

# Criar arquivos vazios
foreach ($file in $files) {
    New-Item -ItemType File -Force -Path "$root/$file" | Out-Null
}

Write-Host "Estrutura do SIGE-AO criada com sucesso em ./$root"













import { useState, useRef, useEffect, FormEvent } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'

interface Escola {
    id: number
    nome: string
    sigla: string | null
    provincia: string | null
    municipio: string | null
    cor_primaria: string
    cor_secundaria: string
    tema: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSave: (data: FormData) => Promise<void>
    escola: Escola | null
    saving: boolean
}

export default function EscolaModal({ open, onClose, onSave, escola, saving }: Props) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState({
        nome: "", sigla: "", provincia: "", municipio: "",
        cor_primaria: "#CF0921", cor_secundaria: "#FFD700", tema: "claro"
    })

    useEffect(() => {
        if (escola) {
            setForm({
                nome: escola.nome,
                sigla: escola.sigla || "",
                provincia: escola.provincia || "",
                municipio: escola.municipio || "",
                cor_primaria: escola.cor_primaria,
                cor_secundaria: escola.cor_secundaria,
                tema: escola.tema
            })
        } else {
            setForm({ nome: "", sigla: "", provincia: "", municipio: "", cor_primaria: "#CF0921", cor_secundaria: "#FFD700", tema: "claro" })
        }
    }, [escola, open])

    const focusStyle = { outline: 'none' }

    useEffect(() => { // TRAVA ESC
        if (!open) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') e.preventDefault()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open])

    if (!open) return null

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        Object.entries(form).forEach(([k, v]) => formData.append(k, v))
        if (fileRef.current?.files?.[0]) {
            formData.append("logo", fileRef.current.files[0])
        }
        onSave(formData)
    }

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="w-[95vw] max-w-[600px] p-0 flex flex-col shadow-2xl overflow-hidden mx-auto hide-scrollbar"
                style={{
                    backgroundColor: '#1A1A1A',
                    color: '#fff',
                    border: `1px solid ${form.cor_primaria}`,
                    borderRadius: '1rem',
                    height: '85vh',
                    maxHeight: '85vh'
                }}
            >
                <style>{`
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="p-5 pb-3 shrink-0 text-left" style={{ borderBottom: `1px solid ${form.cor_primaria}4D` }}>
                        <h2 className="text-lg font-bold" style={{ color: '#fff' }}>{escola ? "Editar Escola" : "Cadastrar Escola"}</h2>
                        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{escola ? "Altere os dados abaixo." : "Preencha os dados da escola"}</p>
                    </div>

                    <div className="grid gap-4 py-4 px-5 overflow-y-auto flex-1 min-h-0 hide-scrollbar">
                        <p className="text-sm font-semibold -mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Dados da Escola</p>

                        {/* COLUNA FIXA DE 120px PARA LABEL FICAR ALINHADA */}
                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label htmlFor="nome" className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Nome *</label>
                            <input id="nome" value={form.nome} onChange={e => handleChange('nome', e.target.value)} className="text-xs h-9 px-3 rounded-md w-full" style={{ backgroundColor: '#000', color: '#fff', border: `1px solid ${form.cor_primaria}`, borderRadius: '0.5rem', ...focusStyle }} required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label htmlFor="sigla" className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Sigla</label>
                            <input id="sigla" value={form.sigla} onChange={e => handleChange('sigla', e.target.value)} className="text-xs h-9 px-3 rounded-md w-full" style={{ backgroundColor: '#000', color: '#fff', border: `1px solid ${form.cor_primaria}`, borderRadius: '0.5rem', ...focusStyle }} placeholder="EEMJC" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label htmlFor="provincia" className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Província</label>
                            <input id="provincia" value={form.provincia} onChange={e => handleChange('provincia', e.target.value)} className="text-xs h-9 px-3 rounded-md w-full" style={{ backgroundColor: '#000', color: '#fff', border: `1px solid ${form.cor_primaria}`, borderRadius: '0.5rem', ...focusStyle }} placeholder="Luanda" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label htmlFor="municipio" className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Município</label>
                            <input id="municipio" value={form.municipio} onChange={e => handleChange('municipio', e.target.value)} className="text-xs h-9 px-3 rounded-md w-full" style={{ backgroundColor: '#000', color: '#fff', border: `1px solid ${form.cor_primaria}`, borderRadius: '0.5rem', ...focusStyle }} placeholder="Talatona" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Cor Primária</label>
                            <input type="color" value={form.cor_primaria} onChange={e => handleChange('cor_primaria', e.target.value)} className="w-full h-9 rounded-md" style={{ backgroundColor: '#000', border: `1px solid ${form.cor_primaria}` }} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Cor Secundária</label>
                            <input type="color" value={form.cor_secundaria} onChange={e => handleChange('cor_secundaria', e.target.value)} className="w-full h-9 rounded-md" style={{ backgroundColor: '#000', border: `1px solid ${form.cor_primaria}` }} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label htmlFor="tema" className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Tema</label>
                            <select id="tema" value={form.tema} onChange={e => handleChange('tema', e.target.value)} className="flex h-9 w-full rounded-md px-3 py-2 text-xs" style={{ backgroundColor: '#000', color: '#fff', border: `1px solid ${form.cor_primaria}`, borderRadius: '0.5rem', ...focusStyle }}>
                                <option value="claro">Claro</option>
                                <option value="escuro">Escuro</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center gap-1 sm:gap-3">
                            <label className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.7)' }}>Logo</label>
                            <div>
                                <input type="file" ref={fileRef} accept="image/*" className="hidden" id="logo-upload" />
                                <label htmlFor="logo-upload" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white/70 cursor-pointer hover:bg-white/20 text-xs h-9" style={{ border: `1px dashed ${form.cor_primaria}` }}>
                                    <Upload className="w-4 h-4" /> Enviar Logo
                                </label>
                            </div>
                        </div>

                    </div>

                    <div className="p-4 shrink-0 flex-col sm:flex-row gap-2 flex" style={{ backgroundColor: '#1A1A1A', borderTop: `1px solid ${form.cor_primaria}4D` }}>
                        <button type="submit" disabled={saving} className="gap-2 text-sm w-full sm:flex-1 h-10 font-bold rounded-md flex items-center justify-center" style={{ background: `linear-gradient(90deg, ${form.cor_primaria} 0%, ${form.cor_secundaria} 100%)`, color: '#000', borderRadius: '0.5rem' }}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {escola ? "Salvar Alterações" : "Salvar"}
                        </button>
                        <button type="button" onClick={onClose} className="text-sm w-full sm:flex-1 h-10 font-semibold rounded-md" style={{ backgroundColor: 'transparent', color: '#fff', border: `1px solid ${form.cor_primaria}`, borderRadius: '0.5rem' }}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
