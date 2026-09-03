import { ArrowUpRight } from 'lucide-react'

const StatCard = ({ title, value, sub, color = 'white', isGreen = false }: any) => (
  <div className={`rounded-2xl p-5 ${isGreen? 'bg-gradient-to-br from-[#0A4D3E] to-[#0D9488] text-white' : 'bg-white'}`}>
    <div className="flex justify-between items-start mb-4">
      <p className={`text-sm ${isGreen? 'text-white/80' : 'text-gray-500'}`}>{title}</p>
      <ArrowUpRight className={`w-5 h-5 ${isGreen? 'text-white' : ''} border rounded-full p-1`} />
    </div>
    <p className="text-4xl font-bold mb-3">{value}</p>
    <p className={`text-xs ${isGreen? 'text-white/70' : 'text-gray-500'}`}>{sub}</p>
  </div>
)

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* 4 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value="24" sub="Increased from last month" isGreen={true} />
        <StatCard title="Ended Projects" value="10" sub="Increased from last month" />
        <StatCard title="Running Projects" value="12" sub="Increased from last month" />
        <StatCard title="Pending Project" value="2" sub="On Discuss" />
      </div>

      {/* LINHA 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5">
          <p className="font-bold mb-4">Project Analytics</p>
          <div className="flex items-end justify-around h-40">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center">
                <div className={`w-12 rounded-full ${[1,2,3].includes(i)? 'bg-green-600' : 'bg-gray-200'}`} style={{height: `${[60,80,70,90,40,30,20][i]}%`}}></div>
                <p className="text-xs text-gray-500 mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-white rounded-2xl p-5">
          <p className="font-bold mb-4">Reminders</p>
          <p className="font-semibold text-lg">Meeting with Arc Company</p>
          <p className="text-sm text-gray-500 mb-4">Time : 02.00 pm - 04.00 pm</p>
          <button className="w-full bg-[#0A4D3E] text-white py-2.5 rounded-full font-semibold">Start Meeting</button>
        </div>
      </div>

      {/* LINHA 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Collaboration */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex justify-between mb-4">
            <p className="font-bold">Team Collaboration</p>
            <button className="text-xs border px-3 py-1 rounded-full">+ Add Member</button>
          </div>
          {[
            {nome: 'Alexandra Deff', job: 'Github Project Repository', status: 'Completed'},
            {nome: 'Edwin Adenike', job: 'Integrate User Authentication', status: 'In Progress'},
            {nome: 'Isaac Oluwatemi', job: 'Develop Search and Filter', status: 'Pending'},
            {nome: 'David Oshodi', job: 'Responsive Layout', status: 'In Progress'},
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <img src={`https://i.pravatar.cc/40?u=${i}`} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{m.nome}</p>
                <p className="text-xs text-gray-500">Working on: {m.job}</p>
              </div>
              <span className="text-xs">{m.status}</span>
            </div>
          ))}
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-2xl p-5">
          <p className="font-bold mb-4">Project Progress</p>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full border-[16px] border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-[16px] border-green-600 border-b-transparent border-l-transparent" style={{transform: 'rotate(45deg)'}}></div>
              <p className="absolute inset-0 flex items-center justify-center text-4xl font-bold">41%</p>
            </div>
            <p className="text-sm text-gray-500">Project Ended</p>
          </div>
        </div>

        {/* Project List */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex justify-between mb-4">
            <p className="font-bold">Project</p>
            <button className="text-xs border px-3 py-1 rounded-full">+ New</button>
          </div>
          {[
            {nome: 'Develop API Endpoints', due: 'Nov 26, 2024'},
            {nome: 'Onboarding Flow', due: 'Nov 28, 2024'},
            {nome: 'Build Dashboard', due: 'Nov 30, 2024'},
            {nome: 'Optimize Page Load', due: 'Dec 5, 2024'},
            {nome: 'Cross-Browser Testing', due: 'Dec 6, 2024'},
          ].map((p, i) => (
            <div key={i} className="py-3">
              <p className="font-semibold text-sm">{p.nome}</p>
              <p className="text-xs text-gray-500">Due date: {p.due}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Time Tracker */}
      <div className="bg-gradient-to-br from-[#0A4D3E] to-[#0D9488] rounded-2xl p-5 text-white">
        <p className="font-bold mb-2">Time Tracker</p>
        <p className="text-4xl font-bold mb-4">01:24:08</p>
        <div className="flex gap-3">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">||</button>
          <button className="w-10 h-10 bg-red-500 rounded-full"></button>
        </div>
      </div>
    </div>
  )
}
