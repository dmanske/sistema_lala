
'use client'

import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BANK_PRESETS, BankLogos, BankPreset } from './BankLogos'
import { cn } from '@/lib/utils'

interface LogoPickerProps {
    value: string
    onChange: (logoId: string, suggestedColor?: string) => void
}

export function LogoPicker({ value, onChange }: LogoPickerProps) {
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

    const banks    = BANK_PRESETS.filter(p => p.category === 'bank')
    const cards    = BANK_PRESETS.filter(p => p.category === 'card')
    const generics = BANK_PRESETS.filter(p => p.category === 'generic')

    const renderItem = (preset: BankPreset) => {
        const Logo = BankLogos[preset.id] || BankLogos['generic-bank']
        const isSelected = value === preset.id
        const imageUrl = 'imageUrl' in preset ? preset.imageUrl : undefined
        const hasImage = !!imageUrl && !failedImages.has(preset.id)

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
                    className="w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden transition-all"
                    style={{ backgroundColor: `${preset.color}18` }}
                >
                    {hasImage ? (
                        <img
                            src={imageUrl}
                            alt={preset.name}
                            className="w-7 h-7 object-contain"
                            onError={() => setFailedImages(prev => new Set([...prev, preset.id]))}
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

    const Section = ({ title, items }: { title: string; items: readonly BankPreset[] }) => (
        <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground/60 tracking-widest mb-2 px-1">
                {title}
            </p>
            <div className="grid grid-cols-5 gap-1">
                {items.map(renderItem)}
            </div>
        </div>
    )

    return (
        <div className="w-full">
            <ScrollArea className="h-[240px]">
                <div className="space-y-3 pr-3">
                    <Section title="Bancos & Fintechs" items={banks} />
                    <Section title="Bandeiras de Cartão" items={cards} />
                    <Section title="Genéricos" items={generics} />
                </div>
            </ScrollArea>
        </div>
    )
}
