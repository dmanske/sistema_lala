"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { Supplier } from "@/core/domain/Supplier";
import { LocalStorageSupplierRepository } from "@/infrastructure/repositories/LocalStorageSupplierRepository";

export default function EditSupplierPage() {
    const params = useParams();
    const router = useRouter();
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const repo = new LocalStorageSupplierRepository();

    useEffect(() => {
        const fetchSupplier = async () => {
            if (!params.id) return;
            try {
                const data = await repo.getById(params.id as string);
                if (!data) {
                    router.push("/suppliers");
                    return;
                }
                setSupplier(data);
            } catch (error) {
                console.error(error);
                router.push("/suppliers");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSupplier();
    }, [params.id, router]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!supplier) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-heading">Editar Fornecedor</h1>
                <p className="text-muted-foreground">
                    Atualize os dados do fornecedor.
                </p>
            </div>
            <div className="bg-card/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5">
                <SupplierForm mode="edit" initialData={supplier} />
            </div>
        </div>
    );
}
