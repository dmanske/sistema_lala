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
    Banknote,
    ShoppingBag,
    Percent,
    BarChart3,
    Settings,
    Database,
    Menu,
    LogOut,
    Sparkles
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const groups = [
        {
            label: "Operação",
            items: [
                { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: false },
                { name: "Agenda", icon: Calendar, href: "/agenda", active: false },
                { name: "Caixa", icon: Wallet, href: "/cashier", active: false },
            ],
        },
        {
            label: "Pessoas",
            items: [
                { name: "Clientes", icon: Users, href: "/clients", active: true },
                { name: "Profissionais", icon: UserCircle, href: "/professionals", active: false },
            ],
        },
        {
            label: "Catálogo",
            items: [
                { name: "Serviços", icon: Scissors, href: "/services", active: false },
                { name: "Produtos", icon: Package, href: "/products", active: false },
            ],
        },
        {
            label: "Financeiro",
            items: [
                { name: "Financeiro", icon: Banknote, href: "/finance", active: false },
                { name: "Compras", icon: ShoppingBag, href: "/purchases", active: false },
                { name: "Comissões", icon: Percent, href: "/commissions", active: false },
            ],
        },
        {
            label: "Sistema",
            items: [
                { name: "Relatórios", icon: BarChart3, href: "/reports", active: false },
                { name: "Configurações", icon: Settings, href: "/settings", active: false },
                { name: "Cadastros Gerais", icon: Database, href: "/general", active: false },
            ],
        },
    ];

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
                                    const isActive = pathname.startsWith(item.href) || (item.active && pathname.startsWith(item.href));
                                    return (
                                        <Button
                                            key={item.href}
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start font-medium text-sm h-10 px-4 rounded-xl transition-all duration-300",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
                                                    : "text-muted-foreground hover:bg-white/50 hover:text-primary",
                                                !item.active && !isActive && "opacity-60 hover:opacity-100"
                                            )}
                                            asChild={item.active}
                                            disabled={!item.active}
                                        >
                                            {item.active ? (
                                                <Link href={item.href}>
                                                    <item.icon className={cn("mr-3 h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground/70")} />
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

            <div className="mt-auto p-4 m-4 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 shadow-sm flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-white/50">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate text-foreground/80">Admin User</p>
                    <p className="text-xs text-muted-foreground truncate">admin@lalasystem.com</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden fixed top-4 left-4 z-40 bg-white/50 backdrop-blur-md border border-white/20 shadow-sm" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-background/80 backdrop-blur-xl border-r border-white/20">
                    <ScrollArea className="h-full">
                        <SidebarContent />
                    </ScrollArea>
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
