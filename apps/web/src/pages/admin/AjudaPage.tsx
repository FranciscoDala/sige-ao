import { BookOpen, MessageCircleQuestion, Phone, Mail, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react'

export default function AjudaPage() {
    const faqs = [
        { q: "Como cadastrar uma nova escola?", a: "Vá em Painel > Nova Escola > Preencha NIF, Nome, Província e clique em Salvar." },
        { q: "Como desativar um usuário?", a: "Vá em Usuários > Clique em Editar > Desative o toggle 'Ativo' > Salvar Alterações." },
        { q: "Como redefinir a senha de um usuário?", a: "Vá em Usuários > Editar > Digite a nova senha no campo Senha > Salvar." },
        { q: "O que cada perfil pode fazer?", a: "MINISTÉRIO: Acesso total. DIREÇÃO: Gerencia só sua escola. SECRETÁRIO: Cadastra alunos e notas." },
        { q: "Como apagar um usuário permanentemente?", a: "Vá em Usuários > Clique no ícone de Lixeira > Confirmar. Atenção: essa ação não pode ser desfeita." },
    ]

    return (
        <div className="space-y-4">

            {/* HEADER IGUAL DEFINICOES: com icon + titulo text-xl */}
            <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-[#3B82F6]" />
                <div>
                    <h1 className="text-xl font-bold text-white">Ajuda</h1>
                    <p className="text-xs text-gray-400">Tire suas dúvidas e encontre suporte sobre o sige</p>
                </div>
            </div>

            {/* Cards de Contato - PADDING IGUAL DEFINICOES: p-3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl hover:bg-white/10 hover:border-white/20 transition">
                    <BookOpen className="w-6 h-6 text-[#3B82F6] mb-2" />
                    <h3 className="text-white font-semibold text-sm mb-1">Documentação</h3>
                    <p className="text-xs text-gray-400 mb-3">Manual completo do sistema em PDF</p>
                    <a href="#" className="text-[#3B82F6] text-xs font-semibold hover:underline flex items-center gap-1">Baixar Manual <ChevronRight className="w-3.5 h-3.5"/></a>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl hover:bg-white/10 hover:border-white/20 transition">
                    <Mail className="w-6 h-6 text-[#8B5CF6] mb-2" />
                    <h3 className="text-white font-semibold text-sm mb-1">Suporte por Email</h3>
                    <p className="text-xs text-gray-400 mb-3">suporte@sige.ao</p>
                    <a href="mailto:suporte@sige.ao" className="text-[#8B5CF6] text-xs font-semibold hover:underline flex items-center gap-1">Enviar Email <ChevronRight className="w-3.5 h-3.5"/></a>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl hover:bg-white/10 hover:border-white/20 transition">
                    <Phone className="w-6 h-6 text-[#10B981] mb-2" />
                    <h3 className="text-white font-semibold text-sm mb-1">WhatsApp Suporte</h3>
                    <p className="text-xs text-gray-400 mb-3">+244 930438947</p>
                    <a href="https://wa.me/+244930438947" target="_blank" rel="noopener noreferrer" className="text-[#10B981] text-xs font-semibold hover:underline flex items-center gap-1">Falar no WhatsApp <ChevronRight className="w-3.5 h-3.5"/></a>
                </div>
            </div>

            {/* FAQ - PADDING IGUAL DEFINICOES */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 p-3 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                    <MessageCircleQuestion className="w-4 h-4 text-[#3B82F6]" />
                    <h2 className="text-base font-semibold text-white">Perguntas Frequentes</h2>
                </div>
                <div className="space-y-2">
                    {faqs.map((item, i) => (
                        <details key={i} className="bg-white/5 p-3 rounded-xl group cursor-pointer hover:bg-white/10 transition">
                            <summary className="text-white font-medium text-sm list-none flex justify-between items-center">
                                {item.q}
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition" />
                            </summary>
                            <p className="text-gray-400 text-xs mt-2">{item.a}</p>
                        </details>
                    ))}
                </div>
            </div>

            {/* Info do Sistema - PADDING IGUAL DEFINICOES */}
            <div className="bg-white/5 backdrop-blur-xl border-white/10 p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#3B82F6]" />
                    <div>
                        <p className="text-white font-semibold text-sm">SIGE v1.0.3</p>
                        <p className="text-[11px] text-gray-400">Última atualização: 05/09/2026</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
