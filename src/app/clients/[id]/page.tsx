"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Phone,
    MessageCircle,
    Calendar,
    MapPin,
    CreditCard,
    User,
    Loader2,
    LayoutDashboard,
    History,
    CalendarDays,
    Wallet
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteClientDialog } from "@/components/clients/DeleteClientDialog";

import { Client } from "@/core/domain/Client";
import { ClientService } from "@/core/services/ClientService";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { formatName } from "@/core/formatters/name";
import { formatPhone } from "@/core/formatters/phone";
import { formatDate } from "@/core/formatters/date";

// Tabs
import { ClientSummaryTab } from "@/components/clients/tabs/ClientSummaryTab";
import { ClientAppointmentsTab } from "@/components/clients/tabs/ClientAppointmentsTab";
import { ClientHistoryTab } from "@/components/clients/tabs/ClientHistoryTab";
import { ClientCreditTab } from "@/components/clients/tabs/ClientCreditTab";

export default function ClientProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const repo = new LocalStorageClientRepository();
    const service = new ClientService(repo);

    useEffect(() => {
        const fetchClient = async () => {
            if (!params.id) return;
            try {
                const data = await service.getById(params.id as string);
                if (!data) {
                    router.push("/clients");
                    return;
                }
                setClient(data);
            } catch (error) {
                console.error(error);
                router.push("/clients");
            } finally {
                setIsLoading(false);
            }
        };

        fetchClient();
    }, [params.id, router]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-500 hover:bg-green-600 shadow-sm">Ativo</Badge>;
            case "INACTIVE":
                return <Badge variant="secondary">Inativo</Badge>;
            case "ATTENTION":
                return <Badge variant="destructive">Atenção</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/50">
                    <Link href="/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">Perfil do Cliente</h1>
                    <p className="text-sm text-muted-foreground">Gerencie informações, histórico e saldo.</p>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card className="border-none bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl shadow-xl shadow-purple-500/5 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-400/10 to-transparent"></div>
                <CardContent className="relative pt-0 px-6 sm:px-10 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                            <AvatarImage src={client.photoUrl} alt={client.name} />
                            <AvatarFallback className="text-4xl bg-white text-primary font-bold">
                                {getInitials(client.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2 mb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h2 className="text-3xl font-bold font-heading text-foreground">{formatName(client.name)}</h2>
                                {getStatusBadge(client.status)}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white/20">
                                    <Phone className="h-3.5 w-3.5 text-primary" /> {formatPhone(client.phone)}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white/20">
                                    <MessageCircle className="h-3.5 w-3.5 text-green-600" /> {formatPhone(client.whatsapp)}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white/20">
                                    <MapPin className="h-3.5 w-3.5 text-orange-500" /> {client.city}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            <div className="text-right">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Saldo em Crédito</span>
                                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-800">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.creditBalance)}
                                </span>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" asChild className="bg-white/50 hover:bg-white border-primary/20 text-primary-700 hover:text-primary rounded-xl flex-1 sm:flex-none">
                                    <Link href={`/clients/${client.id}/edit`}>
                                        <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="rounded-xl opacity-80 hover:opacity-100 flex-1 sm:flex-none"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-white/40 backdrop-blur-md border border-white/20 p-1 rounded-xl h-auto">
                    <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5">
                        <LayoutDashboard className="h-4 w-4 mr-2 hidden sm:inline" /> Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5">
                        <CalendarDays className="h-4 w-4 mr-2 hidden sm:inline" /> Agenda
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5">
                        <History className="h-4 w-4 mr-2 hidden sm:inline" /> Histórico
                    </TabsTrigger>
                    <TabsTrigger value="credit" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary py-2.5">
                        <Wallet className="h-4 w-4 mr-2 hidden sm:inline" /> Crédito
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="summary">
                        <ClientSummaryTab />
                    </TabsContent>
                    <TabsContent value="appointments">
                        <ClientAppointmentsTab />
                    </TabsContent>
                    <TabsContent value="history">
                        <ClientHistoryTab />
                    </TabsContent>
                    <TabsContent value="credit">
                        <ClientCreditTab clientId={client.id} creditBalance={client.creditBalance} />
                    </TabsContent>
                </div>
            </Tabs>

            <DeleteClientDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                clientId={client.id}
                clientName={client.name}
            />
        </div>
    );
}
