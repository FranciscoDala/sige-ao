import { useState, useEffect, FormEvent, MouseEvent } from 'react'
import { X, Loader2, Calendar, CalendarDays, Save } from 'lucide-react'
import { toast } from 'sonner'

type AnoLetivoStatus = 'ATIVO' | 'FECHADO' | 'PLANEJAMENTO'

type AnoLetivo = {
  id: number
  nome: string
  status: AnoLetivoStatus
  data_inicio: string
  data_fim: string
  escola_id?: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: {
    nome: string
    data_inicio: string
    data_fim: string
  }) => Promise<void>
  saving: boolean
  ano: AnoLetivo | null
}

export default function AnoLetivoModal({
  open,
  onClose,
  onSave,
  saving,
  ano,
}: Props) {
  const [form, setForm] = useState({
    nome: '',
    data_inicio: '',
    data_fim: '',
  })
  const [tema, setTema] = useState<any>(null)
  const isEdit = !!ano

  useEffect(() => {
    const loadTema = () => {
      const t = localStorage.getItem('escola_tema')
      if (t) setTema(JSON.parse(t))
    }

    loadTema()
    window.addEventListener('escola-tema-updated', loadTema)

    return () => {
      window.removeEventListener('escola-tema-updated', loadTema)
    }
  }, [])

  const isClaro = tema?.tema === 'claro'
  const corPrimaria = tema?.cor_primaria || '#3B82F6'
  const corSecundaria = tema?.cor_secundaria || '#8B5CF6'
  const textPrimary = isClaro ? '#1E293B' : 'white'
  const textSecondary = isClaro ? '#64748B' : '#9CA3AF'
  const bgCard = isClaro ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)'
  const borderCard = isClaro ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'

  const getCardStyle = () => {
    const estilo = tema?.estilo_card || 'arredondado'

    if (isClaro) {
      const base = 'bg-white border'
      switch (estilo) {
        case 'quadrado':
          return `${base} rounded-none`
        case 'minimalista':
          return `${base} rounded-lg border-0`
        case 'elevado':
          return `${base} rounded-2xl shadow-2xl`
        case 'borda_colorida':
          return `${base} rounded-2xl border-2`
        case 'glass':
          return `${base} rounded-2xl`
        default:
          return `${base} rounded-2xl`
      }
    }

    const base = 'bg-white/5 backdrop-blur-xl border'
    switch (estilo) {
      case 'quadrado':
        return `${base} rounded-none`
      case 'minimalista':
        return `${base} rounded-lg border-0`
      case 'elevado':
        return `${base} rounded-2xl shadow-2xl shadow-black/20`
      case 'borda_colorida':
        return `${base} rounded-2xl border-2`
      case 'glass':
        return 'bg-white/10 backdrop-blur-2xl border rounded-2xl'
      default:
        return `${base} rounded-2xl`
    }
  }

  const cardClass = getCardStyle()

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return

    if (isEdit && ano) {
      setForm({
        nome: ano.nome,
        data_inicio: ano.data_inicio,
        data_fim: ano.data_fim,
      })
      return
    }

    const anoAtual = new Date().getFullYear()
    const nomePadrao = `${anoAtual}/${anoAtual + 1}`

    setForm({
      nome: nomePadrao,
      data_inicio: `${anoAtual}-09-01`,
      data_fim: `${anoAtual + 1}-07-15`,
    })
  }, [open, ano, isEdit])

  if (!open) return null

  const validateBackendRules = () => {
    const nomeRegex = /^\d{4}\/\d{4}$/
    if (!form.nome.trim()) {
      toast.error('O nome do ano é obrigatório')
      return false
    }
    if (!nomeRegex.test(form.nome.trim())) {
      toast.error('O nome deve seguir o formato: 2026/2027')
      return false
    }

    if (!form.data_inicio) {
      toast.error('Data de início é obrigatória')
      return false
    }

    if (!form.data_fim) {
      toast.error('Data de fim é obrigatória')
      return false
    }

    const inicio = new Date(form.data_inicio)
    const fim = new Date(form.data_fim)

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
      toast.error('Datas inválidas')
      return false
    }

    if (fim <= inicio) {
      toast.error('A data de fim deve ser maior que a data de início')
      return false
    }

    const inicioMes = inicio.getMonth() + 1
    const fimMes = fim.getMonth() + 1

    if (inicioMes !== 9) {
      toast.error('A data de início deve ser em Setembro')
      return false
    }

    if (![6, 7].includes(fimMes)) {
      toast.error('A data de fim deve ser em Junho ou Julho')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateBackendRules()) return

    await onSave({
      nome: form.nome.trim(),
      data_inicio: form.data_inicio,
      data_fim: form.data_fim,
    })
  }

  const handleChange = (field: 'nome' | 'data_inicio' | 'data_fim', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const inputClass = `w-full min-w-0 h-10 px-3 rounded-xl focus:outline-none focus:ring-2 transition appearance-none text-sm`
  const labelClass = 'text-sm font-medium flex items-center gap-2'

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        className={`w-full max-w-[380px] ${cardClass} flex-col max-h-[90vh] overflow-hidden`}
        style={{ borderColor: borderCard }}
      >
        <div
          className="shrink-0 border-b p-4 pb-3"
          style={{ borderColor: borderCard }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold" style={{ color: textPrimary }}>
                {isEdit ? 'Editar Ano Letivo' : 'Cadastrar Ano Letivo'}
              </h2>
              <p className="mt-1 text-xs" style={{ color: textSecondary }}>
                {isEdit ? 'Atualizar período letivo' : 'Definir novo período escolar'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 transition hover:bg-black/10"
            >
              <X className="h-4 w-4" style={{ color: textSecondary }} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto px-4 py-3">
            <div>
              <label className={`${labelClass} mb-1.5`} style={{ color: textPrimary }}>
                <Calendar className="h-3.5 w-3.5" style={{ color: corPrimaria }} />
                Nome do Ano *
              </label>
              <input
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={inputClass}
                style={{
                  background: bgCard,
                  border: `1px solid ${borderCard}`,
                  color: textPrimary,
                }}
                placeholder="Ex: 2026/2027"
                required
              />
            </div>

            <div>
              <label className={`${labelClass} mb-1.5`} style={{ color: textPrimary }}>
                <CalendarDays className="h-3.5 w-3.5" style={{ color: corPrimaria }} />
                Data Início *
              </label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={(e) => handleChange('data_inicio', e.target.value)}
                className={inputClass}
                style={{
                  background: bgCard,
                  border: `1px solid ${borderCard}`,
                  color: textPrimary,
                  colorScheme: isClaro ? 'light' : 'dark',
                }}
                required
              />
            </div>

            <div>
              <label className={`${labelClass} mb-1.5`} style={{ color: textPrimary }}>
                <CalendarDays className="h-3.5 w-3.5" style={{ color: corPrimaria }} />
                Data Fim *
              </label>
              <input
                type="date"
                value={form.data_fim}
                onChange={(e) => handleChange('data_fim', e.target.value)}
                className={inputClass}
                style={{
                  background: bgCard,
                  border: `1px solid ${borderCard}`,
                  color: textPrimary,
                  colorScheme: isClaro ? 'light' : 'dark',
                }}
                required
              />
            </div>
          </div>

          <div
            className="shrink-0 border-t p-3"
            style={{
              borderColor: borderCard,
              background: isClaro ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="order-2 h-10 w-full rounded-xl border px-4 text-sm font-semibold transition sm:order-1 sm:w-auto sm:flex-1"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="order-1 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 sm:order-2 sm:w-auto sm:flex-1"
                style={{
                  background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})`,
                  borderRadius:
                    tema?.estilo_card === 'quadrado'
                      ? '0.5rem'
                      : tema?.estilo_card === 'minimalista'
                        ? '0.25rem'
                        : '0.75rem',
                }}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
