"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cake, Calendar, MessageCircle, ChevronRight, Gift, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Client } from "@/core/domain/Client";
import { getClientRepository } from "@/infrastructure/repositories/factory";
import { cn } from "@/lib/utils";

export function BirthdayCard() {
    const [birthdays, setBirthdays] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                const repo = getClientRepository();
                const allClients = await repo.getAll({ status: 'ACTIVE' });

                const today = new Date();
                const currentMonth = today.getMonth(); // 0-indexed

                const birthdayClients = allClients
                    .filter(client => {
                        if (!client.birthDate) return false;
                        const { month } = parseBirthDate(client.birthDate);
                        return month === currentMonth;
                    })
                    .sort((a, b) => {
                        const { day: dayA } = parseBirthDate(a.birthDate!);
                        const { day: dayB } = parseBirthDate(b.birthDate!);
                        return dayA - dayB;
                    });

                setBirthdays(birthdayClients);
            } catch (error) {
                console.error('Failed to fetch birthdays:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBirthdays();
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const parseBirthDate = (dateStr: string) => {
        const isISO = dateStr.includes('-');
        const parts = dateStr.split(isISO ? '-' : '/');
        // ISO: [YYYY, MM, DD], BR: [DD, MM, YYYY]
        const day = isISO ? parseInt(parts[2]) : parseInt(parts[0]);
        const month = isISO ? parseInt(parts[1]) - 1 : parseInt(parts[1]) - 1;
        const year = isISO ? parseInt(parts[0]) : parseInt(parts[2]);
        return { day, month, year };
    };

    const isBirthdayToday = (birthDate: string) => {
        const today = new Date();
        const { day, month } = parseBirthDate(birthDate);
        return day === today.getDate() && month === today.getMonth();
    };

    const getTurningAge = (birthDate: string) => {
        const { year } = parseBirthDate(birthDate);
        const currentYear = new Date().getFullYear();
        return currentYear - year;
    };

    if (isLoading) {
        return (
            <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 rounded-3xl">
                <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2 font-heading text-lg">
                        <div className="p-2 bg-pink-100 rounded-xl">
                            <Cake className="h-5 w-5 text-pink-500" />
                        </div>
                        Aniversariantes
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (birthdays.length === 0) {
        const currentMonthName = meses[new Date().getMonth()];
        return (
            <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-lg shadow-purple-500/5 rounded-[2rem] overflow-hidden">
                <div className="h-1.5 w-full bg-slate-200" />
                <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="flex items-center gap-2 font-heading text-lg">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <Cake className="h-5 w-5 text-slate-400" />
                        </div>
                        Aniversariantes
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8">
                    <div className="text-center py-6">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Gift className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-sm font-medium text-slate-400 capitalize">Nenhum em {currentMonthName}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const displayBirthdays = birthdays.slice(0, 5);
    const hasMore = birthdays.length > 5;
    const currentMonthName = meses[new Date().getMonth()];

    return (
        <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-xl shadow-purple-500/5 rounded-[2rem] overflow-hidden group">
            <div className="h-1.5 w-full bg-gradient-to-r from-pink-400 to-purple-500" />
            <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-heading text-xl">
                        <div className="p-2 bg-pink-50 rounded-xl group-hover:scale-110 transition-transform">
                            <Cake className="h-5 w-5 text-pink-500" />
                        </div>
                        Aniversariantes
                    </CardTitle>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 font-bold rounded-lg capitalize">
                        {currentMonthName}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
                <div className="space-y-3">
                    {displayBirthdays.map(client => {
                        const isToday = isBirthdayToday(client.birthDate!);
                        const age = getTurningAge(client.birthDate!);
                        const { day } = parseBirthDate(client.birthDate!);

                        return (
                            <Link
                                key={client.id}
                                href={`/clients/${client.id}`}
                                className={cn(
                                    "flex items-center gap-4 p-3 rounded-2xl transition-all border group/item relative overflow-hidden",
                                    isToday
                                        ? "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100 shadow-md shadow-pink-500/5"
                                        : "bg-white/50 border-white/20 hover:bg-white hover:border-pink-200"
                                )}
                            >
                                <div className="relative">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm rounded-2xl overflow-hidden">
                                        <AvatarImage src={client.photoUrl} alt={client.name} className="object-cover" />
                                        <AvatarFallback className={cn(
                                            "text-xs font-bold rounded-2xl",
                                            isToday ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600"
                                        )}>
                                            {getInitials(client.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {isToday && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                                            <Sparkles className="h-3 w-3 text-pink-500" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-sm text-slate-800 line-clamp-1 group-hover/item:text-pink-600 transition-colors">
                                            {client.name}
                                        </p>
                                        {isToday && (
                                            <Badge className="bg-pink-500 hover:bg-pink-500 text-[10px] h-4 px-1.5 py-0">
                                                Hoje!
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        <span>Dia {day}</span>
                                        <span className="text-pink-400">•</span>
                                        <span className="text-pink-600 font-bold">{age} anos</span>
                                    </div>
                                </div>

                                {client.whatsapp && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 p-0 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.open(`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                    </Button>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {hasMore && (
                    <Link href="/aniversarios" className="block w-full">
                        <Button variant="ghost" className="w-full mt-2 text-xs font-bold text-slate-500 hover:text-pink-600 hover:bg-pink-50/50 rounded-xl h-10 border border-transparent hover:border-pink-100">
                            Ver todos os {birthdays.length}
                            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
