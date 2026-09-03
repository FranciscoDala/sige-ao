import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutGrid, ListTodo, Calendar, BarChart3, Users,
  Settings, HelpCircle, LogOut, Search, Mail, Bell, Plus
} from 'lucide-react'
import { authService } from '../services/auth'

const menuItems = [
  { section: 'MENU', items: [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: ListTodo, label: 'Tasks', path: '/dashboard/tasks', badge: '12+' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: Users, label: 'Team', path: '/dashboard/team' },
  ]},
  { section: 'GENERAL', items: [
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    { icon: HelpCircle, label: 'Help', path: '/dashboard/help' },
    { icon: LogOut, label: 'Logout', path: '/logout' },
  ]}
]

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = authService.getUser() || { nome: 'Totok Michael', email: 'tmichael20@mail.com' }

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] font-['Bricolage_Grotesque']">

      {/* SIDEBAR ESQUERDA */}
      <aside className="w-64 bg-white p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold">Donezo</h1>
        </div>

        {/* Menu */}
        {menuItems.map(sec => (
          <div key={sec.section} className="mb-6">
            <p className="text-xs text-gray-400 mb-3 px-2">{sec.section}</p>
            <nav className="space-y-1">
              {sec.items.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                      isActive? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        ))}

        {/* Card Download App */}
        <div className="mt-auto bg-gradient-to-b from-[#0A4D3E] to-[#0D9488] rounded-2xl p-4 text-white">
          <p className="font-bold mb-1">Download our<br/>Mobile App</p>
          <p className="text-xs text-white/70 mb-3">Get easy in another way</p>
          <button className="w-full bg-white text-[#0A4D3E] font-semibold py-2 rounded-lg text-sm">Download</button>
        </div>
      </aside>

      {/* CONTEUDO DIREITO */}
      <div className="flex-1 p-8">
        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search task"
              className="w-full pl-10 pr-16 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none"
            />
            <span className="absolute right-3 top-2 text-xs bg-gray-100 px-2 py-0.5 rounded">⌘F</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 bg-white rounded-lg"><Mail className="w-5 h-5" /></button>
            <button className="p-2 bg-white rounded-lg"><Bell className="w-5 h-5" /></button>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/40" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-sm">{user.nome}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* HEADER + BOTOES */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Plan, prioritize, and accomplish your tasks with ease.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#0A4D3E] text-white px-5 py-2.5 rounded-full font-semibold">
              <Plus className="w-4 h-4" /> Add Project
            </button>
            <button className="border border-gray-300 px-5 py-2.5 rounded-full font-semibold">Import Data</button>
          </div>
        </div>

        {/* AQUI VAI O CONTEUDO DO DASHBOARD */}
        <Outlet />
      </div>
    </div>
  )
}
