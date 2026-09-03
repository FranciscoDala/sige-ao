import { ArrowUpRight, Plus, Video, Pause, Square } from 'lucide-react'

export default function Dashboard() {
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-bold text-[#111827]">Dashboard</h2>
          <p className="text-gray-500 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#059669] text-white px-5 py-2.5 rounded-xl font-semibold text-sm"><Plus className="w-4 h-4" /> Add Project</button>
          <button className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white">Import Data</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* 4 CARDS */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#059669] to-[#10B981] rounded-2xl p-5 text-white">
            <div className="flex justify-between items-start mb-5">
              <p className="text-sm text-white/80">Total Projects</p>
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
            </div>
            <p className="text-4xl font-bold mb-3">24</p>
            <div className="flex items-center gap-1 text-xs bg-white/20 w-fit px-2 py-1 rounded-md"><span className="font-bold">5+</span> Increased from last month</div>
          </div>

          {[
            {title: 'Ended Projects', value: '10', sub: '6+ Increased from last month'},
            {title: 'Running Projects', value: '12', sub: '2+ Increased from last month'},
            {title: 'Pending Project', value: '2', sub: 'On Discuss'},
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border-gray-100">
              <div className="flex justify-between items-start mb-5">
                <p className="text-sm text-gray-500">{card.title}</p>
                <div className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-gray-600" /></div>
              </div>
              <p className="text-4xl font-bold mb-3 text-[#111827]">{card.value}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {card.sub.includes('+') && <span className="bg-gray-100 px-1.5 py-0.5 rounded font-bold">{card.sub.split(' ')[0]}</span>}
                {card.sub.replace(/^\S+\s/, '')}
              </div>
            </div>
          ))}
        </div>

        {/* LINHA 2 */}
        <div className="col-span-12 xl:col-span-6 bg-white rounded-2xl p-6 border-gray-100">
          <p className="font-bold text-[#111827] mb-6">Project Analytics</p>
          <div className="flex items-end justify-around h-44">
            {[30, 70, 60, 85, 40, 35, 45].map((h, i) => (
              <div key={i} className="text-center">
                <div className={`w-10 rounded-t-2xl ${[1,2,3].includes(i)? 'bg-[#059669]' : 'bg-[repeating-linear-gradient(45deg,#e5e7eb,#e5e7eb_4px,white_4px,white_8px)]'}`} style={{height: `${h}%`}}></div>
                <p className="text-xs text-gray-500 mt-3">{['S','M','T','W','T','F','S'][i]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 bg-white rounded-2xl p-6 border-gray-100">
          <p className="font-bold text-[#111827] mb-4">Reminders</p>
          <p className="font-semibold text-lg text-[#111827] mb-1">Meeting with Arc Company</p>
          <p className="text-sm text-gray-500 mb-6">Time : 02.00 pm - 04.00 pm</p>
          <button className="w-full bg-[#059669] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"><Video className="w-4 h-4" /> Start Meeting</button>
        </div>

        <div className="col-span-12 xl:col-span-3 bg-white rounded-2xl p-6 border-gray-100">
          <div className="flex justify-between mb-4">
            <p className="font-bold text-[#111827]">Project</p>
            <button className="text-xs border border-gray-300 px-3 py-1 rounded-full">+ New</button>
          </div>
          {[
            {nome: 'Develop API Endpoints', due: 'Nov 26, 2024', cor: 'bg-blue-500'},
            {nome: 'Onboarding Flow', due: 'Nov 28, 2024', cor: 'bg-cyan-500'},
            {nome: 'Build Dashboard', due: 'Nov 30, 2024', cor: 'bg-purple-400'},
            {nome: 'Optimize Page Load', due: 'Dec 5, 2024', cor: 'bg-yellow-500'},
            {nome: 'Cross-Browser Testing', due: 'Dec 6, 2024', cor: 'bg-pink-500'},
          ].map((p, i) => (
            <div key={i} className="flex gap-3 py-3">
              <div className={`w-1 h-10 ${p.cor} rounded-full mt-1`}></div>
              <div>
                <p className="font-semibold text-sm text-[#111827]">{p.nome}</p>
                <p className="text-xs text-gray-500">Due date: {p.due}</p>
              </div>
            </div>
          ))}
        </div>

        {/* LINHA 3 */}
        <div className="col-span-12 xl:col-span-5 bg-white rounded-2xl p-6 border-gray-100">
          <div className="flex justify-between mb-4">
            <p className="font-bold text-[#111827]">Team Collaboration</p>
            <button className="text-xs border border-gray-300 px-3 py-1 rounded-full">+ Add Member</button>
          </div>
          {[
            {nome: 'Alexandra Deff', job: 'Github Project Repository', status: 'Completed'},
            {nome: 'Edwin Adenike', job: 'Integrate User Authentication System', status: 'In Progress'},
            {nome: 'Isaac Oluwatemi', job: 'Develop Search and Filter Functionality', status: 'Pending'},
            {nome: 'David Oshodi', job: 'Responsive Layout for Homepage', status: 'In Progress'},
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <img src={`https://i.pravatar.cc/40?u=${i+10}`} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#111827]">{m.nome}</p>
                <p className="text-xs text-gray-500">Working on: <span className="font-medium">{m.job}</span></p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-md font-semibold ${m.status === 'Completed'? 'text-green-700 bg-green-50' : m.status === 'Pending'? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50'}`}>{m.status}</span>
            </div>
          ))}
        </div>

        <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl p-6 border-gray-100">
          <p className="font-bold text-[#111827] mb-6">Project Progress</p>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="#E5E7EB" strokeWidth="20" fill="none"/>
                <circle cx="96" cy="96" r="80" stroke="#059669" strokeWidth="20" fill="none" strokeDasharray="502" strokeDashoffset="295"/>
                <circle cx="96" cy="96" r="80" stroke="#065F46" strokeWidth="20" fill="none" strokeDasharray="502" strokeDashoffset="200"/>
              </svg>
              <div className="absolute inset-0 flex-col items-center justify-center">
                <p className="text-5xl font-bold text-[#111827]">41%</p>
                <p className="text-sm text-gray-500">Project Ended</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#059669] rounded-full"></div> Completed</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#065F46] rounded-full"></div> In Progress</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[repeating-linear-gradient(45deg,#9ca3af,#9ca3af_2px,white_2px,white_4px)] rounded-full"></div> Pending</div>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 bg-gradient-to-br from-[#065F46] to-[#047857] rounded-2xl p-6 text-white">
          <p className="font-bold mb-4">Time Tracker</p>
          <p className="text-4xl font-bold mb-6 font-mono">01:24:08</p>
          <div className="flex gap-3">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black"><Pause className="w-5 h-5" /></button>
            <button className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"><Square className="w-4 h-4 fill-white" /></button>
          </div>
        </div>

      </div>
    </div>
  )
}
