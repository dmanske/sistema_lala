
'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BANK_PRESETS, BankLogos } from './BankLogos'
import { cn } from '@/lib/utils'

interface LogoPickerProps {
    value: string
    onChange: (logoId: string, suggestedColor?: string) => void
}

const GENERIC_IDS = ['generic-bank', 'generic-card', 'generic-wallet', 'money', 'piggy-bank']

export function LogoPicker({ value, onChange }: LogoPickerProps) {
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

    const handleImageError = (id: string) => {
        setFailedImages(prev => new Set([...prev, id]))
    }

    const banks = BANK_PRESETS.filter(p => !GENERIC_IDS.includes(p.id))
    const generics = BANK_PRESETS.filter(p => GENERIC_IDS.includes(p.id))

    const renderLogoItem = (preset: typeof BANK_PRESETS[0]) => {
        const Logo = BankLogos[preset.id] || BankLogos['generic-bank']
        const isSelected = value === preset.id
        const hasImage = !!preset.imageUrl && !failedImages.has(preset.id)

        return (
            <button
                key={preset.id}
                type="button"
                onClick={() => onChange(preset.id, preset.color)}
                className={cn(
                    "group flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-150",
                    "hover:scale-105 hover:shadow-md",
                    isSelected
                        ? "border-primary/50 bg-primary/5 shadow-sm scale-[1.03]"
                        : "border-transparent bg-muted/30 hover:border-muted-foreground/20 hover:bg-background"
                )}
                title={preset.name}
            >
                <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                    style={{ backgroundColor: `${preset.color}18` }}
                >
                    {hasImage ? (
                        <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            className="w-6 h-6 object-contain"
                            onError={() => handleImageError(preset.id)}
                        />
                    ) : (
                        <Logo className="w-5 h-5" style={{ color: preset.color }} />
                    )}
                </div>
                <span className="text-[9px] font-medium text-muted-foreground w-full text-center truncate leading-tight px-0.5">
                    {preset.name}
                </span>
            </button>
        )
    }

    return (
        <div className="w-full">
            <ScrollArea className="h-[230px]">
                <div className="space-y-3 pr-3">
                    <div>
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground/60 tracking-widest mb-2 px-1">
                            Bancos & Fintechs
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                            {banks.map(renderLogoItem)}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground/60 tracking-widest mb-2 px-1">
                            Genéricos
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                            {generics.map(renderLogoItem)}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
