"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ClientForm } from "@/components/clients/ClientForm";
import { Client } from "@/core/domain/Client";
import { ClientService } from "@/core/services/ClientService";
import { LocalStorageClientRepository } from "@/infrastructure/repositories/LocalStorageClientRepository";

export default function EditClientPage() {
    const params = useParams();
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!client) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
                <p className="text-muted-foreground">
                    Atualize os dados do cliente.
                </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <ClientForm mode="edit" initialData={client} />
            </div>
        </div>
    );
}
