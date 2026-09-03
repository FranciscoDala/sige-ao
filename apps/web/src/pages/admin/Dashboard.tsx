import { Users, UserPlus, UserMinus, Briefcase, ArrowUpRight, Plus, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react'

const StatCard = ({ icon, title, value, percent, color, isUp }: any) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 bg-[#F7F3EA] rounded-xl flex items-center justify-center">{icon}</div>
      <ArrowUpRight className="w-4 h-4 text-gray-400" />
    </div>
    <div className="flex items-center gap-2 mb-1">
      <p className="text-2xl font-bold">{value}</p>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isUp? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>{percent}</span>
    </div>
    <p className="text-sm text-gray-500">{title}</p>
  </div>
)

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* 5 CARDS PRIMEIRA LINHA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-[#0A4D3E]" />} title="Total Employee" value="310" percent="+ 3.72%" isUp={true} />
        <StatCard icon={<UserPlus className="w-5 h-5 text-[#0A4D3E]" />} title="Total Applicant" value="1,244" percent="+ 5.02%" isUp={true} />
        <StatCard icon={<Users className="w-5 h-5 text-[#0A4D3E]" />} title="New Employees" value="1,298K" percent="- 1.72%" isUp={false} />
        <StatCard icon={<UserMinus className="w-5 h-5 text-[#0A4D3E]" />} title="Resigned Employees" value="1,298K" percent="- 3.72%" isUp={false} />

        <button className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md transition">
          <div className="w-12 h-12 bg-[#0A4D3E] rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-700">Add new widget</p>
        </button>
      </div>

      {/* 3 COLUNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Jobs */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-800">Active Jobs</p>
              <p className="text-2xl font-bold">24 <span className="text-sm font-normal text-gray-500">Jobs</span></p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
          {[
            {nome: 'Senior Product Designer', tipo: 'On-Site', cor: 'bg-purple-100'},
            {nome: 'NodeJs Developer', tipo: 'On-Site', cor: 'bg-green-100'},
            {nome: 'ReactJs Developer', tipo: 'On-Site', cor: 'bg-blue-100'},
            {nome: 'Wordpress Developer', tipo: 'On-Site', cor: 'bg-indigo-100'},
          ].map((job, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
              <div className={`w-10 h-10 ${job.cor} rounded-lg flex items-center justify-center font-bold text-xs`}>{job.nome[0]}</div>
              <div>
                <p className="font-semibold text-sm">{job.nome}</p>
                <p className="text-xs text-gray-500">{job.tipo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-800">Upcoming Interviews</p>
              <p className="text-2xl font-bold">12 <span className="text-sm font-normal text-gray-500">Interviews</span></p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          {[
            {nome: 'Ruben Philips', cargo: 'UX/UI Designer'},
            {nome: 'Emery Donin', cargo: 'ReactJs Developer'},
            {nome: 'Charlie Korsgaard', cargo: 'MongoDB Architect'},
            {nome: 'Ryan Vaccaro', cargo: 'Node Js Developer'},
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/40?u=${i}`} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">{p.nome}</p>
                  <p className="text-xs text-gray-500">{p.cargo}</p>
                </div>
              </div>
              <span className="text-xs bg-[#F7F3EA] px-3 py-1.5 rounded-full">Mon 12, 2023 - 10:00 AM</span>
            </div>
          ))}
        </div>

        {/* Employment Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-800">Employment Status</p>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex justify-between mb-3">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="font-bold">3109</p>
          </div>
          <div className="flex gap-1 h-2 mb-4 rounded-full overflow-hidden">
            <div className="bg-[#0A4D3E] w-[20%]"></div>
            <div className="bg-[#0D6B59] w-[25%]"></div>
            <div className="bg-[#0F8A75] w-[15%]"></div>
            <div className="bg-[#2DD4BF] w-[20%]"></div>
            <div className="bg-[#99F6E4] flex-1"></div>
          </div>
          {['Permanent Employees', 'Contract Employees', 'Temporary Employees', 'Freelancers', 'Interns'].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0A4D3E]"></div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
              <p className="font-semibold">3109</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
