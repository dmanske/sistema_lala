import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ClientHistoryTab() {
    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Histórico de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <p>O histórico de serviços realizados aparecerá aqui.</p>
                </div>
            </CardContent>
        </Card>
    );
}
