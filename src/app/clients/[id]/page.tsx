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
    MapPin,
    Calendar,
    CreditCard,
    User,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteClientDialog } from "@/components/clients/DeleteClientDialog";

import { Client } from "@/core/domain/Client";
import { ClientService } from "@/core/services/ClientService";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";
import { formatName } from "@/core/formatters/name";
import { formatPhone } from "@/core/formatters/phone";
import { formatDate } from "@/core/formatters/date";

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
                return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/clients">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Voltar para Lista</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-t-4 border-t-primary">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4">
                                <AvatarImage src={client.photoUrl} alt={client.name} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {getInitials(client.name)}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{formatName(client.name)}</h2>
                            <div className="mt-2 mb-6">
                                {getStatusBadge(client.status)}
                            </div>

                            <div className="w-full space-y-2">
                                <Button className="w-full gap-2" asChild>
                                    <Link href={`/clients/${client.id}/edit`}>
                                        <Pencil className="h-4 w-4" /> Editar Perfil
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" /> Excluir Cliente
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Crédito Disponível
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                <span className="text-2xl font-bold">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(client.creditBalance)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" /> Informações Pessoais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Telefone
                                    </span>
                                    <p className="font-medium">{formatPhone(client.phone)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <MessageCircle className="h-3 w-3" /> WhatsApp
                                    </span>
                                    <p className="font-medium">{formatPhone(client.whatsapp)}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Data de Nascimento
                                    </span>
                                    <p className="font-medium">
                                        {formatDate(client.birthDate)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Cidade
                                    </span>
                                    <p className="font-medium">{client.city}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <span className="text-sm text-muted-foreground">Observações</span>
                                <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-line min-h-[100px]">
                                    {client.notes || "Nenhuma observação registrada."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <DeleteClientDialog
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                clientId={client.id}
                clientName={client.name}
            />
        </div>
    );
}
