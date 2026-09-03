import { Folder, FileText, FileSpreadsheet, FileImage, Link2 } from 'lucide-react'

export default function Dashboard() {
    const quickAccess = [
        { title: 'Documentos', subtitle: 'Design Files', active: true },
        { title: 'Fotos', subtitle: 'Google Photos', active: false },
        { title: 'Treinamentos', subtitle: 'Training Materials', active: false },
    ]

    const files = [
        { name: 'Relatório Semanal.docx', type: 'doc', date: '03 Set 2026, 10:30', size: '2.4 MB' },
        { name: 'Planilha Notas.xlsx', type: 'xls', date: '02 Set 2026, 14:20', size: '1.1 MB' },
        { name: 'Regulamento.pdf', type: 'pdf', date: '01 Set 2026, 09:15', size: '5.2 MB' },
    ]

    const getIcon = (type: string) => {
        if (type === 'doc') return <FileText className="w-5 h-5 text-blue-500" />
        if (type === 'xls') return <FileSpreadsheet className="w-5 h-5 text-green-500" />
        if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />
        return <FileText className="w-5 h-5" />
    }

    return (
        <div>
            {/* Título */}
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Painel Principal</h2>
                <Folder className="w-6 h-6 text-[#1E40AF]" />
            </div>

            {/* ACESSO RÁPIDO */}
            <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wider">ACESSO RÁPIDO</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {quickAccess.map((item, i) => (
                    <div
                        key={i}
                        className={`rounded-2xl p-5 cursor-pointer transition ${item.active
                                ? 'bg-[#1E40AF] text-white'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                    >
                        <p className={`text-xs mb-3 ${item.active ? 'text-white/50' : 'text-gray-400'}`}>COMPARTILHADO</p>
                        <div className="flex -space-x-2 mb-4">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className={`w-8 h-8 rounded-full border-2 border-white ${item.active ? 'bg-white/30' : 'bg-gray-300'
                                    }`}></div>
                            ))}
                        </div>
                        <p className="font-bold">{item.title}</p>
                        <p className={`text-xs ${item.active ? 'text-white/70' : 'text-gray-500'}`}>{item.subtitle}</p>
                    </div>
                ))}
            </div>

            {/* TODOS OS ARQUIVOS */}
            <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wider">TODOS OS ARQUIVOS</h3>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="text-left text-xs font-bold text-gray-500 border-b">
                        <tr>
                            <th className="p-4">NOME</th>
                            <th className="p-4">PROPRIETÁRIO</th>
                            <th className="p-4">ÚLTIMA MODIFICAÇÃO</th>
                            <th className="p-4">TAMANHO</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                                <td className="p-4 flex items-center gap-3">
                                    {getIcon(file.type)}
                                    <span className="font-medium text-gray-800">{file.name}</span>
                                </td>
                                <td className="p-4"><div className="w-7 h-7 rounded-full bg-gray-300"></div></td>
                                <td className="p-4 text-sm text-gray-600">{file.date}</td>
                                <td className="p-4 text-sm text-gray-600">{file.size}</td>
                                <td className="p-4"><Link2 className="w-4 h-4 text-gray-400" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
