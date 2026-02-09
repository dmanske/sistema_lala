import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ClientAppointmentsTab() {
    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
                <CardTitle>Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <p>O módulo de Agenda ainda não está conectado.</p>
                    <p className="text-sm mt-2">Os agendamentos futuros aparecerão aqui.</p>
                </div>
            </CardContent>
        </Card>
    );
}
