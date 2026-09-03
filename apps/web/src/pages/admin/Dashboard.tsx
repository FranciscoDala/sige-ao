import { Users, UserPlus, UserMinus, Briefcase, ArrowUpRight, Plus, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react'

const StatCard = ({ icon, title, value, percent, isUp }: any) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm relative h-36"> {/* <- altura fixa */}
    {/* Icone + Seta topo */}
    <div className="flex items-start justify-between">
      <div className="w-10 h-10 bg-[#F7F3EA] rounded-xl flex items-center justify-center">{icon}</div>
      <ArrowUpRight className="w-4 h-4 text-gray-400" />
    </div>

    {/* NUMERO canto esquerdo */}
    <p className="text-3xl font-bold absolute top-5 left-5">{value}</p>

    {/* TAG % centralizada */}
    <div className="flex justify-center mt-10 mb-2">
      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
        isUp? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}>{percent}</span>
    </div>

    {/* Titulo embaixo centralizado */}
    <p className="text-sm text-gray-500 text-center">{title}</p>
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

        <button className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md transition"> {/* <- FALTAVA O flex */}
          <div className="w-12 h-12 bg-[#0A4D3E] rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm font-medium text-gray-700">Add new widget</p>
        </button>
      </div>

      {/* 3 COLUNAS - O resto está igual, só traduzi os títulos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Escolas Ativas */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-800">Escolas Ativas</p>
              <p className="text-2xl font-bold">24 <span className="text-sm font-normal text-gray-500">Escolas</span></p>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
          {[
            {nome: 'Escola Mutamba', tipo: 'Pública', cor: 'bg-purple-100'},
            {nome: 'Escola do Futuro', tipo: 'Privada', cor: 'bg-green-100'},
            {nome: 'Complexo Escolar', tipo: 'Pública', cor: 'bg-blue-100'},
            {nome: 'Centro Educacional', tipo: 'Privada', cor: 'bg-indigo-100'},
          ].map((job, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b last:border-0">
              <div className={`w-10 h-10 ${job.cor} rounded-lg flex items-center justify-center font-bold text-xs text-gray-700`}>{job.nome[0]}</div>
              <div>
                <p className="font-semibold text-sm">{job.nome}</p>
                <p className="text-xs text-gray-500">{job.tipo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Próximas Reuniões */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-800">Próximas Reuniões</p>
              <p className="text-2xl font-bold">12 <span className="text-sm font-normal text-gray-500">Reuniões</span></p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          {[
            {nome: 'Reunião Pedagógica', cargo: 'Diretor Geral'},
            {nome: 'Conselho de Turma', cargo: 'Coordenador'},
            {nome: 'Reunião de Pais', cargo: 'Secretário'},
            {nome: 'Planejamento', cargo: 'Professores'},
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/40?u=${i}`} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">{p.nome}</p>
                  <p className="text-xs text-gray-500">{p.cargo}</p>
                </div>
              </div>
              <span className="text-xs bg-[#F7F3EA] px-3 py-1.5 rounded-full">Seg 12, 2026 - 10:00</span>
            </div>
          ))}
        </div>

        {/* Status de Usuários */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-800">Status de Usuários</p>
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex justify-between mb-3">
            <p className="text-sm text-gray-500">Total de Usuários</p>
            <p className="font-bold">3109</p>
          </div>
          <div className="flex gap-1 h-2 mb-4 rounded-full overflow-hidden">
            <div className="bg-[#0A4D3E] w-[20%]"></div>
            <div className="bg-[#0D6B59] w-[25%]"></div>
            <div className="bg-[#0F8A75] w-[15%]"></div>
            <div className="bg-[#2DD4BF] w-[20%]"></div>
            <div className="bg-[#99F6E4] flex-1"></div>
          </div>
          {['Diretores', 'Professores', 'Secretários', 'Administrativos', 'Alunos'].map((item, i) => (
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
