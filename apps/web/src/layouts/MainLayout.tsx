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
  const user = authService.getUser() || { nome: 'Super Admin', email: 'admin@sige.com' }

  return (
    <div className="flex min-h-screen bg-[#F4F6F8] font-['Inter']">

      {/* SIDEBAR ESQUERDA 240px */}
      <aside className="w-[240px] bg-white p-5 flex-col border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#059669] rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-[3px] border-white rounded-full"></div>
          </div>
          <h1 className="text-lg font-bold text-[#111827]">Donezo</h1>
        </div>

        {/* Menu */}
        {menuItems.map(sec => (
          <div key={sec.section} className="mb-6">
            <p className="text-[10px] text-gray-400 mb-2 px-3 font-semibold tracking-widest uppercase">{sec.section}</p>
            <nav className="space-y-1">
              {sec.items.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                      isActive? 'bg-[#ECFDF5] text-[#059669] font-semibold' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                    {item.badge && <span className="ml-auto text-[10px] bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-md font-bold">{item.badge}</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        ))}
      </aside>

      {/* CONTEUDO DIREITO */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-[420px]">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search task"
              className="w-full pl-11 pr-14 py-2.5 bg-white rounded-lg border border-gray-200 focus:outline-none text-sm shadow-sm"
            />
            <span className="absolute right-3 top-2.5 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">⌘F</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm"><Mail className="w-5 h-5 text-gray-600" /></button>
            <button className="p-2.5 bg-white rounded-lg border-gray-200 shadow-sm"><Bell className="w-5 h-5 text-gray-600" /></button>
            <div className="flex items-center gap-3 pl-2">
              <img src="https://i.pravatar.cc/40" className="w-9 h-9 rounded-full" />
              <div>
                <p className="font-semibold text-sm text-[#111827]">{user.nome}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTEUDO */}
        <Outlet />
      </div>
    </div>
  )
}
