import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
                <p className="text-muted-foreground">
                    Cadastre um novo cliente no sistema.
                </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
                <ClientForm mode="create" />
            </div>
        </div>
    );
}
