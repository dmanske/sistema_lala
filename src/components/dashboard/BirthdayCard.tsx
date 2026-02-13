"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cake, Calendar, MessageCircle, ChevronRight } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { Client } from "@/core/domain/Client";
import { getClientRepository } from "@/infrastructure/repositories/factory";

export function BirthdayCard() {
    const [birthdays, setBirthdays] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBirthdays = async () => {
            try {
                const repo = getClientRepository();
                const allClients = await repo.getAll({ status: 'ACTIVE' });
                
                const currentMonth = new Date().getMonth() + 1;
                
                const birthdayClients = allClients
                    .filter(client => {
                        if (!client.birthDate) return false;
                        const birthMonth = new Date(client.birthDate).getMonth() + 1;
                        return birthMonth === currentMonth;
                    })
                    .sort((a, b) => {
                        const dayA = new Date(a.birthDate!).getDate();
                        const dayB = new Date(b.birthDate!).getDate();
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

    const isBirthdayToday = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        return birth.getDate() === today.getDate() && 
               birth.getMonth() === today.getMonth();
    };

    const getAge = (birthDate: string) => {
        return differenceInYears(new Date(), new Date(birthDate));
    };

    if (isLoading) {
        return (
            <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 font-heading text-lg">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Aniversariantes do Mês
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
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
        return (
            <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 font-heading text-lg">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Aniversariantes do Mês
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Cake className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                        <p className="text-sm">Nenhum aniversariante este mês</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const displayBirthdays = birthdays.slice(0, 10);
    const hasMore = birthdays.length > 10;

    return (
        <Card className="border-white/20 bg-card/40 backdrop-blur-xl shadow-lg shadow-purple-500/5">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 font-heading text-lg">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Aniversariantes do Mês
                    </CardTitle>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                        {birthdays.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {displayBirthdays.map(client => {
                        const isToday = isBirthdayToday(client.birthDate!);
                        const age = getAge(client.birthDate!);
                        const birthDay = new Date(client.birthDate!).getDate();
                        
                        return (
                            <Link
                                key={client.id}
                                href={`/clients/${client.id}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors group border border-transparent hover:border-pink-200"
                            >
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src={client.photoUrl} alt={client.name} />
                                    <AvatarFallback className="text-xs bg-pink-100 text-pink-700 font-bold">
                                        {getInitials(client.name)}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm text-slate-800 truncate group-hover:text-primary transition-colors">
                                            {client.name}
                                        </p>
                                        {isToday && (
                                            <Badge className="bg-pink-500 hover:bg-pink-600 text-xs px-2 py-0">
                                                Hoje!
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{birthDay} de {format(new Date(client.birthDate!), 'MMMM', { locale: ptBR })}</span>
                                        <span className="text-pink-600 font-medium">• {age + 1} anos</span>
                                    </div>
                                </div>

                                {client.whatsapp && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.open(`https://wa.me/55${client.whatsapp}`, '_blank');
                                        }}
                                    >
                                        <MessageCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {hasMore && (
                    <Link href="/clients?filter=birthdays">
                        <Button variant="ghost" className="w-full mt-2 text-sm text-primary hover:text-primary hover:bg-primary/5">
                            Ver todos os {birthdays.length} aniversariantes
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
