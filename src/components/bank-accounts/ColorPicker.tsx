'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#64748B', // Slate
  '#71717A', // Zinc
]

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[140px] justify-start gap-2 h-9 px-2 relative overflow-hidden"
        >
          <div
            className="h-5 w-5 rounded-full shadow-sm border border-black/10 shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-muted-foreground font-normal truncate flex-1 text-left">
            {PRESET_COLORS.includes(value) ? 'Cor predefinida' : 'Cor personalizada'}
          </span>
          {/* Background splash */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundColor: value }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color)
                setOpen(false)
              }}
              className={cn(
                "w-8 h-8 rounded-full border border-border flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                value === color ? "ring-2 ring-offset-2 ring-primary" : ""
              )}
              style={{ backgroundColor: color }}
            >
              {value === color && <Check className="h-4 w-4 text-white drop-shadow-md" />}
            </button>
          ))}

          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border group cursor-pointer hover:border-primary">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-muted/50 group-hover:bg-transparent">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
