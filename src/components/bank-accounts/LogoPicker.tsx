
'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BANK_PRESETS, getBankLogo, BankLogos } from './BankLogos'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoPickerProps {
    value: string
    onChange: (logoId: string, suggestedColor?: string) => void
}

export function LogoPicker({ value, onChange }: LogoPickerProps) {
    const handleSelect = (preset: typeof BANK_PRESETS[0]) => {
        onChange(preset.id, preset.color)
    }

    return (
        <div className="w-full border rounded-md p-2">
            <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pr-4">
                    {BANK_PRESETS.map((preset) => {
                        const Logo = BankLogos[preset.id]
                        const isSelected = value === preset.id

                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelect(preset)}
                                className={cn(
                                    "group flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all hover:bg-muted/50 hover:border-foreground/20",
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                        : "border-transparent bg-muted/30"
                                )}
                                title={preset.name}
                            >
                                <div
                                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                                    style={{ color: preset.color }}
                                >
                                    <Logo className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground w-full text-center truncate px-1">
                                    {preset.name}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}
