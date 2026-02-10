import { SupplierForm } from "@/components/suppliers/SupplierForm";

export default function NewSupplierPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-heading">Novo Fornecedor</h1>
                <p className="text-muted-foreground">
                    Cadastre um novo fornecedor ou parceiro.
                </p>
            </div>
            <div className="bg-card/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg shadow-purple-500/5">
                <SupplierForm mode="create" />
            </div>
        </div>
    );
}
