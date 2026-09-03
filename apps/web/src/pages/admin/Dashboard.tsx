import { ArrowUpRight, Plus, Video } from 'lucide-react'

const StatCard = ({ title, value, sub, isGreen = false }: any) => (
  <div className={`rounded-xl p-5 ${isGreen? 'bg-[#059669] text-white' : 'bg-white border border-gray-200'}`}>
    <div className="flex justify-between items-start mb-5">
      <p className={`text-sm ${isGreen? 'text-white/80' : 'text-gray-500'}`}>{title}</p>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isGreen? 'bg-white/20' : 'border border-gray-200'}`}>
        <ArrowUpRight className={`w-4 h-4 ${isGreen? 'text-white' : 'text-gray-600'}`} />
      </div>
    </div>
    <p className="text-3xl font-bold mb-3">{value}</p>
    {sub && (
      <div className={`flex items-center gap-1 text-xs w-fit px-2 py-1 rounded-md ${isGreen? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
        {sub}
      </div>
    )}
  </div>
)

export default function Dashboard() {
  return (
    <div>
      {/* HEADER + BOTOES */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">Dashboard</h2>
          <p className="text-gray-500 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#059669] text-white px-4 py-2.5 rounded-lg font-semibold text-sm">
            <Plus className="w-4 h-4" /> Add Project
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm bg-white">Import Data</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* LINHA 1: 4 CARDS */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Total Projects" value="24" sub="5+ Increased from last month" isGreen={true} />
          <StatCard title="Ended Projects" value="10" sub="6+ Increased from last month" />
          <StatCard title="Running Projects" value="12" sub="2+ Increased from last month" />
          <StatCard title="Pending Project" value="2" sub="On Discuss" />
        </div>

        {/* LINHA 2 */}
        <div className="col-span-12 xl:col-span-6 bg-white rounded-xl p-5 border-gray-200">
          <p className="font-bold text-[#111827] mb-4">Project Analytics</p>
          <div className="h-40 bg-gray-50 rounded-lg"></div> {/* Gráfico vazio por enquanto */}
        </div>

        <div className="col-span-12 xl:col-span-3 bg-white rounded-xl p-5 border-gray-200">
          <p className="font-bold text-[#111827] mb-3">Reminders</p>
          <p className="font-semibold text-base text-[#111827]">Meeting with Arc Company</p>
          <p className="text-sm text-gray-500 mb-5">Time : 02.00 pm - 04.00 pm</p>
          <button className="w-full bg-[#059669] text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
            <Video className="w-4 h-4" /> Start Meeting
          </button>
        </div>

        <div className="col-span-12 xl:col-span-3 bg-white rounded-xl p-5 border-gray-200">
          <div className="flex justify-between mb-4">
            <p className="font-bold text-[#111827]">Project</p>
            <button className="text-xs border border-gray-300 px-3 py-1 rounded-full text-gray-600">+ New</button>
          </div>
          {[
            {nome: 'Develop API Endpoints', due: 'Nov 26, 2024'},
            {nome: 'Onboarding Flow', due: 'Nov 28, 2024'},
            {nome: 'Build Dashboard', due: 'Nov 30, 2024'},
          ].map((p, i) => (
            <div key={i} className="py-3">
              <p className="font-semibold text-sm text-[#111827]">{p.nome}</p>
              <p className="text-xs text-gray-500">Due date: {p.due}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
