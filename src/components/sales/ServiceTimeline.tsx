"use client"

import { Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SaleItem } from "@/core/domain/sales/types"

interface ServiceTimelineProps {
    services: SaleItem[]
    startTime: string // HH:mm format
    professionalColor?: string
}

export function ServiceTimeline({ services, startTime, professionalColor = "#6366f1" }: ServiceTimelineProps) {
    // Parse start time
    const [startHour, startMinute] = startTime.split(':').map(Number)
    
    // Calculate timeline
    let currentMinutes = startHour * 60 + startMinute
    const timeline = services.map((service) => {
        const duration = 30 // default 30 min for services
        const start = currentMinutes
        currentMinutes += duration
        
        const startHourCalc = Math.floor(start / 60)
        const startMinuteCalc = start % 60
        const endHour = Math.floor(currentMinutes / 60)
        const endMinute = currentMinutes % 60
        
        return {
            service,
            startTime: `${String(startHourCalc).padStart(2, '0')}:${String(startMinuteCalc).padStart(2, '0')}`,
            endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
            duration
        }
    })
    
    const totalDuration = currentMinutes - (startHour * 60 + startMinute)
    const endHour = Math.floor(currentMinutes / 60)
    const endMinute = currentMinutes % 60
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timeline do Atendimento
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Start marker */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                        <div 
                            className="w-3 h-3 rounded-full border-2"
                            style={{ borderColor: professionalColor, backgroundColor: 'white' }}
                        />
                        <div 
                            className="w-0.5 h-8"
                            style={{ backgroundColor: professionalColor }}
                        />
                    </div>
                    <div>
                        <div className="font-semibold text-sm">Início</div>
                        <div className="text-xs text-muted-foreground">{startTime}</div>
                    </div>
                </div>
                
                {/* Services */}
                {timeline.map((item, index) => (
                    <div key={item.service.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: professionalColor }}
                            />
                            {index < timeline.length - 1 && (
                                <div 
                                    className="w-0.5 h-8"
                                    style={{ backgroundColor: professionalColor }}
                                />
                            )}
                        </div>
                        <div className="flex-1 pb-2">
                            <div className="font-medium text-sm">{item.service.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                    {item.startTime} - {item.endTime}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    {item.duration} min
                                </Badge>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* End marker */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: professionalColor }}
                        />
                    </div>
                    <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Término Estimado
                        </div>
                        <div className="text-xs text-muted-foreground">{endTime}</div>
                    </div>
                </div>
                
                {/* Summary */}
                <div className="pt-3 border-t">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Duração Total</span>
                        <span className="font-semibold">{totalDuration} minutos</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
