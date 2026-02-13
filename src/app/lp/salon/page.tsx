'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
    Scissors,
    Sparkles,
    Heart,
    Clock,
    MapPin,
    MessageCircle,
    Star,
    Instagram,
    Phone,
    ChevronDown,
    Award,
    Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SalonLandingPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-purple-100 selection:text-purple-900">
            {/* Smooth Scroll Container */}
            <div className="scroll-smooth">

                {/* Minimal Header */}
                <header className="absolute top-0 left-0 w-full z-50 py-8">
                    <div className="container mx-auto px-6 flex items-center justify-between">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <Scissors className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
                            <span className="text-2xl font-serif font-bold text-white tracking-widest uppercase">Lala Beauty</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-12 text-white/90 text-sm font-medium tracking-widest uppercase">
                            <a href="#services" className="hover:text-white transition-colors">Serviços</a>
                            <a href="#about" className="hover:text-white transition-colors">O Studio</a>
                            <a href="#team" className="hover:text-white transition-colors">Equipe</a>
                            <a href="#gallery" className="hover:text-white transition-colors">Galeria</a>
                        </nav>

                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="hidden sm:flex rounded-full border-white/40 text-white bg-white/10 backdrop-blur-md hover:bg-white hover:text-purple-900 transition-all duration-500 px-8 uppercase tracking-widest text-xs h-12">
                                Agendar agora
                            </Button>
                            <div className="lg:hidden p-2 text-white">
                                <ChevronDown className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section - Full Height */}
                <section className="relative h-screen flex items-center justify-center overflow-hidden">
                    {/* Background with zoom effect */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/images/salon-hero.png"
                            alt="Luxurious Salon Interior"
                            fill
                            className="object-cover scale-105 animate-in zoom-in-110 duration-[10000ms] ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="px-6 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-300" />
                                <span className="text-[10px] sm:text-xs text-white uppercase tracking-[0.3em] font-medium">Beleza • Sofisticação • Luxo</span>
                            </div>
                        </div>

                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-8 tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            Sua essência <br />
                            <span className="italic font-light opacity-80">manifestada</span>
                        </h1>

                        <p className="max-w-xl mx-auto text-lg md:text-xl text-white/70 mb-12 font-light animate-in fade-in slide-in-from-bottom-12 duration-1200">
                            No Lala Beauty Studio, cada detalhe é planejado para proporcionar uma experiência de autocuidado sublime e transformadora.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1400">
                            <Button size="lg" className="h-16 px-12 rounded-full bg-white text-purple-900 hover:bg-purple-50 text-md font-bold uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95">
                                Agendar Experiência
                            </Button>
                            <Button size="lg" variant="link" className="text-white uppercase tracking-widest text-xs h-16 group">
                                Conhecer Serviços <ChevronDown className="ml-2 w-4 h-4 group-hover:translate-y-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                        <div className="w-[1px] h-16 bg-white" />
                    </div>
                </section>

                {/* Services Section */}
                <section id="services" className="py-32 bg-[#faf9f6]">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                            <div className="space-y-4">
                                <h2 className="text-sm uppercase tracking-[0.5em] text-purple-600 font-bold">Nossos Rituais</h2>
                                <h3 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">Onde a arte <br /> encontra o cuidado</h3>
                            </div>
                            <p className="max-w-md text-slate-500 text-lg leading-relaxed font-light">
                                Utilizamos apenas as marcas mais prestigiadas do mundo e técnicas exclusivas para garantir resultados impecáveis.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {/* Service 1 */}
                            <div className="group space-y-6">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                                    <div className="absolute inset-0 bg-purple-900 transition-transform duration-700 translate-y-full group-hover:translate-y-0 opacity-80 z-10" />
                                    <img src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1000" alt="Hair Service" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 text-center">
                                        <p className="text-white/80 text-sm mb-4 leading-relaxed">As melhores técnicas de coloração, mechas e cortes contemporâneos.</p>
                                        <Button variant="outline" className="border-white/40 text-white rounded-full hover:bg-white hover:text-purple-900">Ver Tabela</Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h4 className="text-2xl font-serif">Hair Design</h4>
                                    <span className="text-slate-400 text-sm">A partir de R$ 120</span>
                                </div>
                            </div>

                            {/* Service 2 */}
                            <div className="group space-y-6">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                                    <div className="absolute inset-0 bg-purple-900 transition-transform duration-700 translate-y-full group-hover:translate-y-0 opacity-80 z-10" />
                                    <img src="https://images.unsplash.com/photo-1621605815841-aa88c8210095?auto=format&fit=crop&q=80&w=1000" alt="Manicure" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 text-center">
                                        <p className="text-white/80 text-sm mb-4 leading-relaxed">Blindagem, esmaltação em gel e alongamento com perfeição.</p>
                                        <Button variant="outline" className="border-white/40 text-white rounded-full hover:bg-white hover:text-purple-900">Ver Tabela</Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h4 className="text-2xl font-serif">Nail Aesthetic</h4>
                                    <span className="text-slate-400 text-sm">A partir de R$ 45</span>
                                </div>
                            </div>

                            {/* Service 3 */}
                            <div className="group space-y-6 lg:translate-y-12 transition-transform duration-700">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
                                    <div className="absolute inset-0 bg-purple-900 transition-transform duration-700 translate-y-full group-hover:translate-y-0 opacity-80 z-10" />
                                    <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1000" alt="Makeup" className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 text-center">
                                        <p className="text-white/80 text-sm mb-4 leading-relaxed">Maquiagem para eventos e consultoria de beleza personalizada.</p>
                                        <Button variant="outline" className="border-white/40 text-white rounded-full hover:bg-white hover:text-purple-900">Ver Tabela</Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <h4 className="text-2xl font-serif">Makeup Glow</h4>
                                    <span className="text-slate-400 text-sm">A partir de R$ 180</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About & Stats */}
                <section id="about" className="py-32 relative overflow-hidden bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-24">
                            <div className="relative">
                                <div className="absolute -top-12 -left-12 w-64 h-64 bg-purple-50 rounded-full -z-10 blur-3xl opacity-60" />
                                <div className="rounded-[3rem] overflow-hidden shadow-2xl skew-y-2">
                                    <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1000" alt="Salon Details" className="w-full h-auto" />
                                </div>
                                <div className="absolute bottom-12 -right-8 glass p-8 rounded-3xl border-purple-100 shadow-xl max-w-xs animate-bounce animate-duration-[4000ms]">
                                    <div className="flex gap-2 text-amber-400 mb-2">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-sm font-medium italic text-slate-700">"O atendimento é impecável, o ambiente é um sonho!"</p>
                                    <p className="text-xs text-slate-400 mt-2">— Mariana S.</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <h2 className="text-sm uppercase tracking-[0.5em] text-purple-600 font-bold">Nossa Filosofia</h2>
                                    <h3 className="text-5xl font-serif tracking-tight leading-tight">Um refúgio de bem-estar no coração da cidade</h3>
                                    <p className="text-slate-500 text-lg font-light leading-relaxed">
                                        Desde 2020, o Lala Beauty Studio nasceu com a missão de redefinir o conceito de serviço de beleza. Não entregamos apenas serviços; entregamos confiança e renovação em um ambiente privativo de alto luxo.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-4xl font-serif text-slate-900 tracking-tighter">5.000+</p>
                                        <p className="text-xs uppercase tracking-widest text-slate-400">Atendimentos</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-4xl font-serif text-slate-900 tracking-tighter">15</p>
                                        <p className="text-xs uppercase tracking-widest text-slate-400">Prêmios de Design</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-4xl font-serif text-slate-900 tracking-tighter">100%</p>
                                        <p className="text-xs uppercase tracking-widest text-slate-400">Satisfação</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-4xl font-serif text-slate-900 tracking-tighter">12</p>
                                        <p className="text-xs uppercase tracking-widest text-slate-400">Especialistas</p>
                                    </div>
                                </div>

                                <Button size="lg" className="rounded-full bg-slate-900 text-white h-14 px-10 hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs">
                                    Ver Nossa História
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section id="team" className="py-32 bg-[#1a1a1a] text-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-24 max-w-3xl mx-auto space-y-6">
                            <h2 className="text-sm uppercase tracking-[0.5em] text-purple-400 font-bold">Mestres da Transformação</h2>
                            <h3 className="text-5xl md:text-7xl font-serif leading-tight">Liderados por artistas</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { name: "Lala Manske", role: "Creative Director", img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=600" },
                                { name: "André Silva", role: "Master Colorist", img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=600" },
                                { name: "Carla Diaz", role: "Spa Specialist", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" },
                                { name: "Tiago Neto", role: "Hair Stylist", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600" }
                            ].map((person, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6">
                                        <img src={person.img} alt={person.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                        <div className="absolute bottom-6 left-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                                            <Instagram className="w-5 h-5" />
                                            <Camera className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold tracking-tight">{person.name}</h4>
                                    <p className="text-purple-400 text-sm uppercase tracking-widest font-medium mt-1">{person.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gallery Ribbon */}
                <section id="gallery" className="py-20 bg-white overflow-hidden">
                    <div className="flex gap-4 animate-in slide-in-from-left duration-[20000ms] linear repeat-infinite">
                        <div className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1620331311520-246422ff83f9?auto=format&fit=crop&q=80&w=800" alt="Gallery" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl translate-y-12">
                            <img src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&q=80&w=800" alt="Gallery" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1596178065887-1198b6180b2a?auto=format&fit=crop&q=80&w=800" alt="Gallery" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl translate-y-12">
                            <img src="https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&q=80&w=800" alt="Gallery" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl">
                            <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" alt="Gallery" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-none w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl translate-y-12">
                            <img src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=800" alt="Gallery" className="object-cover w-full h-full" />
                        </div>
                    </div>
                </section>

                {/* Final CTA & Footer */}
                <section className="bg-slate-900 text-white py-32">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto space-y-12">
                            <h2 className="text-sm uppercase tracking-[1em] text-purple-400 font-bold">Reserva Exclusiva</h2>
                            <h3 className="text-6xl md:text-8xl font-serif leading-none italic">Sinta o privilégio de ser você.</h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12">
                                <a href="https://wa.me/55000000000" target="_blank" className="flex items-center gap-4 group">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-500">
                                        <MessageCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs uppercase tracking-widest text-slate-400">WhatsApp</p>
                                        <p className="text-xl font-bold">(48) 99999-9999</p>
                                    </div>
                                </a>
                                <div className="h-[1px] w-12 bg-white/20 hidden sm:block" />
                                <div className="flex items-center gap-4 group">
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-slate-600 transition-colors duration-500">
                                        <MapPin className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs uppercase tracking-widest text-slate-400">Localização</p>
                                        <p className="text-xl font-bold">Av. Beira Mar Norte, 120</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className="mt-40 pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm italic">
                            <div className="flex items-center gap-2 text-white">
                                <Scissors className="w-5 h-5" />
                                <span className="text-xl font-serif font-bold uppercase tracking-widest">Lala Beauty</span>
                            </div>
                            <p>© 2026 Lala Beauty Studio • Crafted with luxury.</p>
                            <div className="flex gap-8">
                                <Instagram className="w-5 h-5 hover:text-white transition-colors" />
                                <Phone className="w-5 h-5 hover:text-white transition-colors" />
                                <Award className="w-5 h-5 hover:text-white transition-colors" />
                            </div>
                        </footer>
                    </div>
                </section>

            </div>
        </div>
    )
}
