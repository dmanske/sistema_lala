'use client'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

const PRESET_ICONS = [
  '🏦', // banco
  '💳', // cartão
  '💰', // dinheiro
  '💵', // nota
  '💴', // yen
  '💶', // euro
  '💷', // libra
  '🏧', // ATM
  '💸', // dinheiro voando
  '🪙', // moeda
  '📱', // celular (digital)
  '💻', // computador
  '🔐', // cofre
  '📊', // gráfico
  '💼', // maleta
]

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PRESET_ICONS.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`w-12 h-12 text-2xl rounded border-2 transition-all hover:scale-110 ${
            value === icon ? 'border-primary bg-primary/10' : 'border-border'
          }`}
          title={icon}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
