import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutGrid, Users, Briefcase, UserCheck, FileText,
  Settings, Bell, Calendar, Download
} from 'lucide-react'
import { authService } from '../services/auth'

const menuItems = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Employees', path: '/dashboard/usuarios' },
  { icon: Briefcase, label: 'Jobs', path: '/dashboard/escolas' },
  { icon: UserCheck, label: 'Candidates', path: '/dashboard/candidatos' },
  { icon: FileText, label: 'Leaves', path: '/dashboard/relatorios' },
]

const traduzirNivel = (nivel: string) => {
  const mapa: any = {
    'super_admin': 'Product Manager',
    'admin_escola': 'Admin Escola',
    'diretor': 'Diretor',
    'secretario': 'Secretário',
  }
  return mapa[nivel] || 'User'
}

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getUser() || { nome: 'Kennedy Jones', nivel: 'super_admin' }

  return (
    <div className="min-h-screen bg-[#F7F3EA]">

      {/* HEADER VERDE */}
      <header className="bg-[#0A4D3E] text-white pb-20">
        {/* Top Nav */}
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] rounded-lg transform rotate-45"></div>
            <h1 className="text-xl font-bold">TalentaSync</h1>
          </div>

          {/* Menu Central com pill */}
          <nav className="flex items-center gap-1 bg-[#0A3D32] p-1 rounded-full">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${
                    isActive? 'bg-white/20 text-white font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Lado Direito */}
          <div className="flex items-center gap-4">
            <button className="text-white/80 hover:text-white"><Settings className="w-5 h-5" /></button>
            <button className="text-white/80 hover:text-white"><Bell className="w-5 h-5" /></button>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/40" alt="avatar" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-sm">{user.nome}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Saudação */}
        <div className="px-8 pt-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Good Morning,</p>
            <h2 className="text-3xl font-bold">{user.nome}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#0A3D32] px-4 py-2 rounded-full text-sm">
              <Calendar className="w-4 h-4" /> 2023
            </button>
            <button className="bg-white text-[#0A4D3E] font-semibold px-5 py-2 rounded-full text-sm">
              Export Data
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO - COM MARGIN NEGATIVA PRA FICAR SOBREPOSTO */}
      <main className="px-8 -mt-12 pb-8">
        <Outlet />
      </main>
    </div>
  )
}
