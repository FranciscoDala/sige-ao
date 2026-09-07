import React, { useState } from 'react'
import { Building, Users, DoorOpen, BookOpen, Calendar } from 'lucide-react'

const tabs = [
    { id: 'turmas', label: 'Turmas', icon: Users },
    { id: 'salas', label: 'Salas', icon: DoorOpen },
    { id: 'professores', label: 'Professores', icon: Users },
    { id: 'disciplinas', label: 'Disciplinas', icon: BookOpen },
    { id: 'horarios', label: 'Horários', icon: Calendar },
]

export default function EscolaDirecaoPage() {
    const [activeTab, setActiveTab] = useState('turmas')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Building className="w-7 h-7" style={{ color: 'var(--cor-primaria)' }} />
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Direção</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestão de Turmas, Salas e Professores</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2 overflow-x-auto" style={{ borderColor: 'var(--border-card)' }}>
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                            style={{
                                backgroundColor: isActive ? 'var(--cor-primaria)20' : 'transparent',
                                color: isActive ? 'var(--cor-primaria)' : 'var(--text-secondary)'
                            }}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Conteúdo da Tab */}
            <div>
                {activeTab === 'turmas' && <div>Conteúdo de Turmas aqui</div>}
                {activeTab === 'salas' && <div>Conteúdo de Salas aqui</div>}
                {activeTab === 'professores' && <div>Conteúdo de Professores aqui</div>}
                {activeTab === 'disciplinas' && <div>Conteúdo de Disciplinas aqui</div>}
                {activeTab === 'horarios' && <div>Conteúdo de Horários aqui</div>}
            </div>
        </div>
    )
}
