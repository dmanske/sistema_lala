"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    Wallet,
    Users,
    UserCircle,
    Scissors,
    Package,
    ShoppingBag,
    Menu,
    LogOut,
    Sparkles,
    Plus,
    Truck,
    Building2,
    Gift,
    Loader2,
    Calculator,
    Receipt,
    FileText,
    TrendingUp,
    Settings,
    FolderTree,
    Briefcase
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthProvider";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

import { useState, useEffect } from "react";

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user, profile, signOut } = useAuth();

    const isDemo = user?.email === 'daniel.manske@gmail.com';
    const userInitials = isDemo ? 'DT' : (profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.charAt(0).toUpperCase() ?? 'U');
    const userName = isDemo ? 'Demonstração' : (profile?.full_name ?? 'Usuário');
    const userEmail = isDemo ? 'demo@lalasystem.com.br' : (user?.email ?? '');

    // Close sidebar when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const groups = [
        {
            label: "Operação",
            items: [
                { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
                { name: "Agenda", icon: Calendar, href: "/agenda", active: true },
            ],
        },
        {
            label: "Pessoas",
            items: [
                { name: "Clientes", icon: Users, href: "/clients", active: true },
                { name: "Aniversários", icon: Gift, href: "/aniversarios", active: true },
                { name: "Fornecedores", icon: Truck, href: "/suppliers", active: true },
                { name: "Profissionais", icon: UserCircle, href: "/professionals", active: true },
            ],
        },
        {
            label: "Catálogo",
            items: [
                { name: "Serviços", icon: Scissors, href: "/services", active: true },
                { name: "Produtos", icon: Package, href: "/products", active: true },
            ],
        },
        {
            label: "Financeiro",
            items: [
                { name: "Dashboard Financeiro", icon: TrendingUp, href: "/dashboard/financial", active: true },
                { name: "Fluxo de Caixa", icon: Wallet, href: "/cash", active: true },
                { name: "Fechamento de Caixa", icon: Calculator, href: "/cash-register", active: true },
                { name: "Dashboard de Contas", icon: Building2, href: "/bank-accounts/dashboard", active: true },
                { name: "Contas Bancárias", icon: Building2, href: "/contas", active: true },
                { name: "Contas a Pagar", icon: Receipt, href: "/accounts-payable", active: true },
                { name: "Contas a Receber", icon: FileText, href: "/receivables", active: true },
                { name: "Compras", icon: ShoppingBag, href: "/purchases", active: true },
                { name: "Relatórios Financeiros", icon: FileText, href: "/reports/financial", active: true },
            ],
        },
        {
            label: "Configurações",
            items: [
                { name: "Centros de Custos", icon: FolderTree, href: "/settings/cost-centers", active: true },
                { name: "Projetos", icon: Briefcase, href: "/settings/projects", active: true },
            ],
        },
    ];

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleSignOut = async () => {
        try {
            setIsLoggingOut(true);
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoggingOut(false);
        }
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-2 px-2 mb-8">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground/80 font-heading">
                        Lala System
                    </span>
                </div>

                <div className="space-y-6">
                    {groups.map((group, i) => (
                        <div key={i} className="px-2">
                            <h3 className="mb-2 px-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">
                                {group.label}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    // Verificação mais precisa: rota exata ou sub-rotas, mas não prefixos parciais
                                    const isActive = pathname === item.href || 
                                        (pathname.startsWith(item.href + '/') && item.href !== '/cash');
                                    
                                    // Caso especial: /cash só deve estar ativo se for exatamente /cash
                                    const isExactCash = item.href === '/cash' && pathname === '/cash';
                                    const finalIsActive = item.href === '/cash' ? isExactCash : isActive;
                                    
                                    return (
                                        <Button
                                            key={item.href}
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start font-medium text-sm h-10 px-4 rounded-xl transition-all duration-300",
                                                finalIsActive
                                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
                                                    : "text-muted-foreground hover:bg-white/50 hover:text-primary",
                                                !item.active && !finalIsActive && "opacity-60 hover:opacity-100"
                                            )}
                                            asChild={item.active}
                                            disabled={!item.active || isLoggingOut}
                                        >
                                            {item.active ? (
                                                <Link href={item.href}>
                                                    <item.icon className={cn("mr-3 h-4 w-4", finalIsActive ? "text-primary-foreground" : "text-muted-foreground/70")} />
                                                    {item.name}
                                                </Link>
                                            ) : (
                                                <div className="flex w-full items-center cursor-not-allowed">
                                                    <item.icon className="mr-3 h-4 w-4 text-muted-foreground/50" />
                                                    {item.name}
                                                </div>
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto p-4 space-y-3">
                <div className="mx-4 p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-white/50">
                        <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-xs font-semibold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium leading-none truncate text-foreground/80">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                </div>

                <div className="px-4">
                    <Button
                        variant="outline"
                        disabled={isLoggingOut}
                        className="w-full justify-start gap-2 h-10 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                        onClick={handleSignOut}
                    >
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}
                        {isLoggingOut ? 'Saindo...' : 'Sair'}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header - Topbar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between z-40 bg-white/60 backdrop-blur-xl border-b border-white/20">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(true)}
                        className="h-10 w-10 text-slate-600 rounded-xl"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                        {pathname === "/clients" ? "Clientes" :
                            pathname === "/agenda" ? "Agenda" :
                                pathname.includes("/clients/") ? "Cliente" : "Lala System"}
                    </h1>
                </div>

                {pathname === "/clients" && (
                    <Button variant="default" size="sm" className="h-9 px-4 rounded-xl shadow-md shadow-primary/20" asChild>
                        <Link href="/clients/new">
                            <Plus className="h-4 w-4 mr-1.5" /> Novo
                        </Link>
                    </Button>
                )}
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-background/80 backdrop-blur-xl border-r border-white/20">
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <span className="font-bold tracking-tight">Lala System</span>
                            </div>
                        </div>
                        <ScrollArea className="flex-1">
                            <SidebarContent />
                        </ScrollArea>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar - Glass Effect */}
            <div className={cn(
                "hidden md:block w-72 h-screen sticky top-0",
                "bg-white/60 backdrop-blur-xl border-r border-white/20 shadow-xl", // Glassmorphism
                className
            )}>
                <ScrollArea className="h-full">
                    <SidebarContent />
                </ScrollArea>
            </div>
        </>
    );
}
