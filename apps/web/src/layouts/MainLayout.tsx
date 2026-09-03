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
    <div className="flex min-h-screen bg-[#F5F6F8]">

      {/* SIDEBAR ESQUERDA */}
      <aside className="w-[260px] bg-white p-6 flex-col border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#0A7A4A] rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold text-[#1f2937]">Donezo</h1>
        </div>

        {/* Menu */}
        {menuItems.map(sec => (
          <div key={sec.section} className="mb-8">
            <p className="text-[11px] text-gray-400 mb-3 px-3 font-semibold tracking-wider">{sec.section}</p>
            <nav className="space-y-1">
              {sec.items.map(item => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive? 'bg-[#E8F5EE] text-[#0A7A4A] font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && <span className="ml-auto text-[10px] bg-[#E8F5EE] text-[#0A7A4A] px-2 py-0.5 rounded-full font-bold">{item.badge}</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        ))}

        {/* Card Download App */}
        <div className="mt-auto bg-gradient-to-br from-[#0A4D3E] to-[#0D9488] rounded-2xl p-5 text-white">
          <p className="font-bold mb-1 leading-tight">Download our<br/>Mobile App</p>
          <p className="text-xs text-white/70 mb-4">Get easy in another way</p>
          <button className="w-full bg-white text-[#0A4D3E] font-semibold py-2.5 rounded-xl text-sm">Download</button>
        </div>
      </aside>

      {/* CONTEUDO DIREITO */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              placeholder="Search task"
              className="w-full pl-12 pr-16 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none text-sm"
            />
            <span className="absolute right-3 top-2.5 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">⌘F</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white rounded-xl border-gray-200"><Mail className="w-5 h-5 text-gray-600" /></button>
            <button className="p-2.5 bg-white rounded-xl border-gray-200"><Bell className="w-5 h-5 text-gray-600" /></button>
            <div className="flex items-center gap-3 pl-3">
              <img src="https://i.pravatar.cc/40" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-sm text-[#1f2937]">{user.nome}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTEUDO DO DASHBOARD */}
        <Outlet />
      </div>
    </div>
  )
}
