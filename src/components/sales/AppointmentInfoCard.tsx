"use client"

import { Appointment } from "@/core/domain/Appointment"
import { Professional } from "@/core/domain/Professional"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, User, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppointmentInfoCardProps {
    appointment: Appointment
    professional: Professional
}

export function AppointmentInfoCard({ appointment, professional }: AppointmentInfoCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'bg-blue-500/10 text-blue-700 border-blue-200'
            case 'DONE':
                return 'bg-green-500/10 text-green-700 border-green-200'
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
            case 'CANCELED':
                return 'bg-red-500/10 text-red-700 border-red-200'
            case 'NO_SHOW':
                return 'bg-gray-500/10 text-gray-700 border-gray-200'
            case 'BLOCKED':
                return 'bg-purple-500/10 text-purple-700 border-purple-200'
            default:
                return 'bg-gray-500/10 text-gray-700 border-gray-200'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Confirmado'
            case 'DONE':
                return 'Concluído'
            case 'PENDING':
                return 'Pendente'
            case 'CANCELED':
                return 'Cancelado'
            case 'NO_SHOW':
                return 'Não Compareceu'
            case 'BLOCKED':
                return 'Bloqueado'
            default:
                return status
        }
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00')
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (timeStr: string) => {
        return timeStr
    }

    const calculateEndTime = (startTime: string, durationMinutes: number) => {
        const [hours, minutes] = startTime.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + durationMinutes
        const endHours = Math.floor(totalMinutes / 60) % 24
        const endMinutes = totalMinutes % 60
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
    }

    const getInitials = (name: string) => {
        const parts = name.split(' ')
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }

    const endTime = calculateEndTime(appointment.startTime, appointment.durationMinutes)

    return (
        <Card className="border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        Informações do Agendamento
                    </CardTitle>
                    <Badge className={cn("border", getStatusColor(appointment.status))}>
                        {getStatusLabel(appointment.status)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Data</div>
                            <div className="text-sm font-medium capitalize">
                                {formatDate(appointment.date)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Horário</div>
                            <div className="text-sm font-medium">
                                {formatTime(appointment.startTime)} - {endTime}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Avatar
                        className="h-10 w-10 border-2"
                        style={{ borderColor: professional.color }}
                    >
                        <AvatarFallback
                            className="text-white font-semibold"
                            style={{ backgroundColor: professional.color }}
                        >
                            {getInitials(professional.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500">Profissional</div>
                        <div className="text-sm font-medium">{professional.name}</div>
                    </div>
                    <User className="h-4 w-4 text-gray-400" />
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Timer className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500">Duração Total</div>
                        <div className="text-sm font-medium">
                            {appointment.durationMinutes} minutos
                            {appointment.durationMinutes >= 60 && (
                                <span className="text-gray-500 ml-1">
                                    ({Math.floor(appointment.durationMinutes / 60)}h {appointment.durationMinutes % 60}min)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes (if any) */}
                {appointment.notes && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-xs text-yellow-700 font-medium mb-1">Observações</div>
                        <div className="text-sm text-yellow-900">{appointment.notes}</div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
