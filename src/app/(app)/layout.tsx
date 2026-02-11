import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-muted/10">
                <div className="container mx-auto p-4 md:p-8 pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
