"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
    value: string
    label: string
    description?: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Selecione...",
    emptyText = "Nenhum item encontrado",
    className,
    disabled = false,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter((item) => item !== value)
            : [...selected, value]
        onChange(newSelected)
    }

    const handleRemove = (value: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(selected.filter((item) => item !== value))
    }

    const selectedOptions = options.filter((option) =>
        selected.includes(option.value)
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-12 rounded-xl bg-white/50 border-slate-200",
                        className
                    )}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {selectedOptions.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            selectedOptions.map((option) => (
                                <Badge
                                    key={option.value}
                                    variant="secondary"
                                    className="rounded-md px-2 py-0.5 font-normal"
                                >
                                    {option.label}
                                    <button
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleRemove(option.value, e as any)
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onClick={(e) => handleRemove(option.value, e)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 rounded-xl" align="start">
                <Command>
                    <CommandInput placeholder="Buscar..." className="h-9" />
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                        {options.map((option) => {
                            const isSelected = selected.includes(option.value)
                            return (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{option.label}</div>
                                        {option.description && (
                                            <div className="text-xs text-muted-foreground">
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
