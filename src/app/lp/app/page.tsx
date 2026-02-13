'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
    Scissors,
    Calendar,
    BarChart3,
    Users2,
    Package,
    ChevronRight,
    CheckCircle2,
    ArrowRight,
    Star,
    LayoutDashboard,
    Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AppLandingPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Smooth Scroll Container */}
            <div className="scroll-smooth">

                {/* Floating Navigation */}
                <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
                    <div className="glass px-6 py-3 rounded-full flex items-center justify-between border-white/40 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                                <Scissors className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tighter text-foreground">Lala System</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Recursos</a>
                            <a href="#stats" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Estatísticas</a>
                            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Planos</a>
                        </div>

                        <Link href="/login">
                            <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                Entrar
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none -z-10">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
                    </div>

                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">A nova era da gestão</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            Domine seu salão com <br />
                            <span className="text-primary italic">tecnologia e elegância</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1200">
                            O Lala System combina gestão inteligente de agenda, finanças e estoque em uma interface luxuosa projetada para elevar o nível da sua experiência profissional.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-16 duration-1400">
                            <Button size="lg" className="h-14 px-8 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 group transition-all">
                                Começar Agora Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-lg font-semibold glass border-white/40 hover:bg-white/40 transition-all">
                                Ver Demonstração
                            </Button>
                        </div>

                        {/* Animated Hero Image */}
                        <div className="relative mx-auto max-w-5xl group animate-in zoom-in-95 fade-in duration-1500 delay-300">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                            <div className="relative rounded-[2rem] border border-white/30 shadow-2xl overflow-hidden glass p-2 backdrop-blur-2xl">
                                <Image
                                    src="/images/app-hero.png"
                                    alt="Lala System Dashboard"
                                    width={1200}
                                    height={800}
                                    className="rounded-xl shadow-inner w-full h-auto"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 relative">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tudo o que você precisa</h2>
                            <p className="text-muted-foreground max-w-xl mx-auto italic">
                                Desenvolvido por especialistas para transformar a gestão complexa em algo simples e prazeroso.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="glass p-8 rounded-3xl border-white/40 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-7 h-7 text-indigo-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Agenda Inteligente</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Multi-visualização (dia, semana, mês), suporte a overbooking e bloqueios restritivos. Nunca perca um horário.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="glass p-8 rounded-3xl border-white/40 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-7 h-7 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Financeiro Fluido</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Fluxo de caixa em tempo real, pagamentos mistos e gestão de fiado integrada ao perfil do cliente.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="glass p-8 rounded-3xl border-white/40 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users2 className="w-7 h-7 text-amber-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">CRM Completo</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Histórico de visitas, estatísticas de consumo e sistema de aniversariantes com integração WhatsApp.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="glass p-8 rounded-3xl border-white/40 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                                <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Package className="w-7 h-7 text-rose-500" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Estoque Auditável</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Acompanhamento rigoroso de movimentações. O sistema reconcilia seu estoque automaticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dashboard Highlights */}
                <section id="stats" className="py-24 bg-primary/5">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Estatísticas que <br /> <span className="text-primary italic">te fazem crescer</span></h2>
                                    <p className="text-lg text-muted-foreground">
                                        Entenda seu negócio como nunca antes. Gráficos intuitivos mostram exatamente o que está gerando mais receita e quem são seus melhores clientes.
                                    </p>
                                </div>

                                <ul className="space-y-4">
                                    {[
                                        "Métricas de LTV e Ticket Médio por cliente",
                                        "Análise de giro de estoque por produto",
                                        "Ranking de profissionais por faturamento",
                                        "Taxa de ocupação da agenda em tempo real"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button size="lg" className="rounded-2xl h-12 shadow-lg shadow-primary/20">
                                    Ver Detalhes do Produto
                                </Button>
                            </div>

                            <div className="flex-1 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[100px] rounded-full" />
                                <div className="relative glass p-4 rounded-[2.5rem] border-white/60 shadow-2xl">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/80 p-6 rounded-2xl shadow-sm space-y-2">
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Faturamento</p>
                                            <p className="text-2xl font-bold text-emerald-600">R$ 12.450,00</p>
                                            <div className="w-full h-1 bg-emerald-100 rounded-full">
                                                <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="bg-white/80 p-6 rounded-2xl shadow-sm space-y-2">
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Clientes Ativos</p>
                                            <p className="text-2xl font-bold text-primary">142</p>
                                            <p className="text-[10px] text-green-600 font-bold">+12% este mês</p>
                                        </div>
                                        <div className="bg-white/80 p-6 rounded-2xl shadow-sm col-span-2 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Top Serviços</p>
                                                <LayoutDashboard className="w-4 h-4 text-primary/40" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Mechas</span>
                                                    <span className="font-bold">R$ 4.200</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                                    <div className="w-[85%] h-full bg-primary rounded-full" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Corte Feminino</span>
                                                    <span className="font-bold">R$ 2.800</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                                    <div className="w-[60%] h-full bg-purple-400 rounded-full" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="py-24 overflow-hidden relative">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto glass p-12 md:p-20 rounded-[3rem] border-white/40 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Star className="w-32 h-32 text-primary" />
                            </div>

                            <div className="flex justify-center gap-1 mb-8">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-primary text-primary" />)}
                            </div>

                            <blockquote className="text-2xl md:text-3xl font-medium leading-tight mb-10 text-foreground italic">
                                "O Lala System mudou completamente como eu vejo meu salão. Antes era caos com papel e planilhas, agora é puro luxo e organização. Meus clientes elogiam até a recepção quando veem as fotos no agendamento."
                            </blockquote>

                            <cite className="not-italic flex flex-col items-center">
                                <span className="font-bold text-lg">Luciana Almeida</span>
                                <span className="text-muted-foreground text-sm uppercase tracking-widest">CEO, Lala Beauty Studio</span>
                            </cite>
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section id="pricing" className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/40 text-center">
                            {/* Decorative bubbles */}
                            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/10 blur-[80px] rounded-full" />
                            <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-purple-400/20 blur-[60px] rounded-full" />

                            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                                    Pronto para elevar o nível do seu negócio?
                                </h2>
                                <p className="text-primary-foreground/80 text-lg">
                                    Junte-se a centenas de salões que já descobriram o poder da gestão premium. Teste grátis por 14 dias, sem compromisso.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                    <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold bg-white text-primary hover:bg-gray-100 transition-all shadow-xl">
                                        Criar Minha Conta
                                    </Button>
                                    <Button size="lg" variant="ghost" className="h-14 px-10 rounded-2xl text-lg font-bold text-white hover:bg-white/10">
                                        Falar com Especialista
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-border mt-20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center">
                                    <Scissors className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="font-bold text-lg tracking-tighter">Lala System</span>
                            </div>

                            <div className="flex gap-8 text-sm text-muted-foreground">
                                <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
                                <a href="#" className="hover:text-primary transition-colors">Termos</a>
                                <a href="#" className="hover:text-primary transition-colors">Contato</a>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                © 2026 Lala System Labs. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    )
}
