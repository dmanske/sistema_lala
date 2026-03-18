import {
    Building2,
    CreditCard,
    Wallet,
    PiggyBank,
    Banknote,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BankPreset {
    id: string
    name: string
    color: string
    category: 'bank' | 'card' | 'generic'
    imageUrl?: string
}

// ── Favicon helper ────────────────────────────────────────────────────────────
// Uses Google's favicon service — covers any bank/company with a website
const gFav = (domain: string) =>
    `https://www.google.com/s2/favicons?sz=128&domain=${domain}`

// ── SVG fallback icons ────────────────────────────────────────────────────────
export const BankLogos: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    // Generic / utility
    'generic-bank': (props) => <Building2 {...props} />,
    'generic-card': (props) => <CreditCard {...props} />,
    'generic-wallet': (props) => <Wallet {...props} />,
    'piggy-bank': (props) => <PiggyBank {...props} />,
    'money': (props) => <Banknote {...props} />,

    // ── Banks ──────────────────────────────────────────────────────────────────
    'nubank': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M8 28a1.5 1.5 0 0 1-1.5-1.5V7.2a1.5 1.5 0 0 1 2.32-1.25l10.36 6.9V5.5A1.5 1.5 0 0 1 20.68 4h3.75a1.5 1.5 0 0 1 1.5 1.5v19.3a1.5 1.5 0 0 1-2.32 1.25l-10.36-6.9v7.35A1.5 1.5 0 0 1 11.75 28H8Z" />
        </svg>
    ),
    'inter': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.12" />
            <path d="M14 8h4v2.5h-4V8Zm0 5.5h4v10.5h-4V13.5Z" />
        </svg>
    ),
    'itau': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="3" fill="currentColor" opacity="0.12" />
            <path d="M15 10h2v12h-2V10Z" />
            <path d="M11 14h2v6h-2v-6Zm8 0h2v6h-2v-6Z" />
            <rect x="11" y="21" width="10" height="2" />
        </svg>
    ),
    'bradesco': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M16 5L5.5 25h21L16 5Zm0 5.5L21.5 23h-11L16 10.5Z" />
        </svg>
    ),
    'santander': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M16 4C10.5 4 6 8.5 6 14c0 3.5 1.8 6.6 4.5 8.4.3.2.5.5.5.9v2.2c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5v-2.2c0-.4.2-.7.5-.9C24.2 20.6 26 17.5 26 14c0-5.5-4.5-10-10-10Zm0 3c3.9 0 7 3.1 7 7s-3.1 7-7 7-7-3.1-7-7 3.1-7 7-7Z" />
        </svg>
    ),
    'bb': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.12" />
            <path d="M9 10h5c2 0 3.5 1.2 3.5 2.8S16 15.5 14 15.5h-2v1.5h2c2.2 0 3.5 1.2 3.5 2.8S16.2 22 14 22H9V10Zm3 2.5v2.5h2c.6 0 1-.4 1-1.2S14.6 12.5 14 12.5h-2Zm0 5v2.5h2c.7 0 1-.4 1-1.2S14.7 17.5 14 17.5h-2Z" />
            <path d="M18 10h5c2 0 3.5 1.2 3.5 2.8S25 15.5 23 15.5h-2v1.5h2c2.2 0 3.5 1.2 3.5 2.8S25.2 22 23 22h-5V10Zm3 2.5v2.5h2c.6 0 1-.4 1-1.2S23.6 12.5 23 12.5h-2Zm0 5v2.5h2c.7 0 1-.4 1-1.2S23.7 17.5 23 17.5h-2Z" />
        </svg>
    ),
    'caixa': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M16 4L4 12v2h2v12h20V14h2v-2L16 4Zm0 3.5L24 13v11H8V13l8-5.5Z" />
            <path d="M12 18h8v6h-8v-6Z" />
        </svg>
    ),
    'c6': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="5" fill="currentColor" opacity="0.12" />
            <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="sans-serif">C6</text>
        </svg>
    ),
    'btg': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" opacity="0.1" />
            <text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="sans-serif">BTG</text>
        </svg>
    ),
    'xp': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" opacity="0.12" />
            <path d="M10 10l4 6-4 6h4l2-3 2 3h4l-4-6 4-6h-4l-2 3-2-3h-4Z" />
        </svg>
    ),
    'safra': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.12" />
            <path d="M12 12c0-2.2 1.8-4 4-4s4 1.8 4 4h-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 .8.5 1.5 1.2 1.8l2.8 1.2c1.7.8 2.8 2.5 2.8 4.4 0 2.2-1.8 4-4 4s-4-1.8-4-4h2c0 1.1.9 2 2 2s2-.9 2-2c0-.8-.5-1.5-1.2-1.8l-2.8-1.2C12.3 15.6 12 14.9 12 12Z" />
        </svg>
    ),
    'original': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <circle cx="16" cy="16" r="5" fill="currentColor" opacity="0.3" />
        </svg>
    ),
    'pan': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" opacity="0.12" />
            <path d="M10 10h6c2.5 0 4.5 2 4.5 4.5S18.5 19 16 19h-3v5h-3V10Zm3 3v3h3c.8 0 1.5-.7 1.5-1.5S16.8 13 16 13h-3Z" />
        </svg>
    ),
    'pagbank': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.12" />
            <path d="M11 12h6c2 0 3.5 1.5 3.5 3.5S19 19 17 19h-3v5h-3V12Zm3 2.5v2h3c.6 0 1-.4 1-1s-.4-1-1-1h-3Z" />
        </svg>
    ),
    'sicoob': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.12" />
            <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="14" r="1.5" />
            <circle cx="20" cy="14" r="1.5" />
            <circle cx="16" cy="19" r="1.5" />
        </svg>
    ),
    'sicredi': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M16 4C9 4 4 9 4 16s5 12 12 12 12-5 12-12S23 4 16 4Zm0 3c4.4 0 8 2.7 8 7 0 2.8-1.5 5-3 6.5l-5 4.5-5-4.5c-1.5-1.5-3-3.7-3-6.5 0-4.3 3.6-7 8-7Z" />
        </svg>
    ),
    'neon': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M18 4l-10 14h8l-2 10 10-14h-8l2-10Z" fill="currentColor" opacity="0.2" />
            <path d="M18 4l-10 14h8l-2 10 10-14h-8l2-10Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    'next': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="12" fill="currentColor" opacity="0.12" />
            <path d="M9 16l7-7v4h7v6h-7v4l-7-7Z" />
        </svg>
    ),
    'will': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <path d="M6 8l4 16h3l3-10 3 10h3l4-16h-3l-2.5 10L18 8h-4l-2.5 10L9 8H6Z" />
        </svg>
    ),
    'picpay': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="8" width="24" height="16" rx="4" fill="currentColor" opacity="0.12" />
            <path d="M12 12h6c2.2 0 4 1.8 4 4s-1.8 4-4 4h-3v4h-3V12Zm3 3v4h3c.6 0 1-.4 1-2s-.4-2-1-2h-3Z" />
        </svg>
    ),
    'mp': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.12" />
            <path d="M8 14h6v8H8v-8Zm10 0h6v8h-6v-8Z" />
            <path d="M12 10a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
    ),

    // ── Cartões / Bandeiras ────────────────────────────────────────────────────
    'visa': (props) => (
        <svg viewBox="0 0 48 32" fill="currentColor" {...props}>
            <rect width="48" height="32" rx="4" fill="currentColor" opacity="0.08" />
            <text x="24" y="22" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="-0.5">VISA</text>
        </svg>
    ),
    'mastercard': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <circle cx="12" cy="16" r="9" fill="currentColor" opacity="0.7" />
            <circle cx="20" cy="16" r="9" fill="currentColor" opacity="0.4" />
        </svg>
    ),
    'elo': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" opacity="0.12" />
            <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="sans-serif">elo</text>
        </svg>
    ),
    'amex': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="3" y="7" width="26" height="18" rx="3" fill="currentColor" opacity="0.12" />
            <text x="16" y="20" textAnchor="middle" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">AMEX</text>
        </svg>
    ),
    'hipercard': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            <rect x="3" y="7" width="26" height="18" rx="3" fill="currentColor" opacity="0.12" />
            <circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.5" />
            <path d="M13 12v8m3-8v8m3-8v8" stroke="white" strokeWidth="1.5" />
        </svg>
    ),
}

// ── Presets ───────────────────────────────────────────────────────────────────
export const BANK_PRESETS: BankPreset[] = [
    // Bancos
    { id: 'nubank',    name: 'Nubank',           color: '#8A05BE', category: 'bank', imageUrl: gFav('nubank.com.br') },
    { id: 'inter',     name: 'Inter',             color: '#FF7A00', category: 'bank', imageUrl: gFav('inter.co') },
    { id: 'itau',      name: 'Itaú',              color: '#EC7000', category: 'bank', imageUrl: gFav('itau.com.br') },
    { id: 'bradesco',  name: 'Bradesco',          color: '#CC092F', category: 'bank', imageUrl: gFav('bradesco.com.br') },
    { id: 'santander', name: 'Santander',         color: '#EC0000', category: 'bank', imageUrl: gFav('santander.com.br') },
    { id: 'bb',        name: 'Banco do Brasil',   color: '#003882', category: 'bank', imageUrl: gFav('bb.com.br') },
    { id: 'caixa',     name: 'Caixa',             color: '#0066B3', category: 'bank', imageUrl: gFav('caixa.gov.br') },
    { id: 'c6',        name: 'C6 Bank',           color: '#242424', category: 'bank', imageUrl: gFav('c6bank.com.br') },
    { id: 'btg',       name: 'BTG Pactual',       color: '#1A1A1A', category: 'bank', imageUrl: gFav('btgpactual.com') },
    { id: 'xp',        name: 'XP Investimentos',  color: '#000000', category: 'bank', imageUrl: gFav('xpi.com.br') },
    { id: 'safra',     name: 'Banco Safra',       color: '#003366', category: 'bank', imageUrl: gFav('safra.com.br') },
    { id: 'original',  name: 'Banco Original',    color: '#00D959', category: 'bank', imageUrl: gFav('original.com.br') },
    { id: 'pan',       name: 'Banco Pan',         color: '#E4003A', category: 'bank', imageUrl: gFav('bancopan.com.br') },
    { id: 'pagbank',   name: 'PagBank',           color: '#05B80A', category: 'bank', imageUrl: gFav('pagbank.com.br') },
    { id: 'picpay',    name: 'PicPay',            color: '#21C25E', category: 'bank', imageUrl: gFav('picpay.com') },
    { id: 'mp',        name: 'Mercado Pago',      color: '#009EE3', category: 'bank', imageUrl: gFav('mercadopago.com.br') },
    { id: 'sicoob',    name: 'Sicoob',            color: '#00A859', category: 'bank', imageUrl: gFav('sicoob.com.br') },
    { id: 'sicredi',   name: 'Sicredi',           color: '#006B3F', category: 'bank', imageUrl: gFav('sicredi.com.br') },
    { id: 'neon',      name: 'Neon',              color: '#00C5FF', category: 'bank', imageUrl: gFav('neon.com.br') },
    { id: 'next',      name: 'Banco Next',        color: '#00D959', category: 'bank', imageUrl: gFav('next.me') },
    { id: 'will',      name: 'Will Bank',         color: '#FF6B00', category: 'bank', imageUrl: gFav('willbank.com.br') },

    // Bandeiras de Cartão
    { id: 'visa',       name: 'Visa',             color: '#1A1F71', category: 'card', imageUrl: 'https://cdn.simpleicons.org/visa/1A1F71' },
    { id: 'mastercard', name: 'Mastercard',       color: '#EB001B', category: 'card', imageUrl: 'https://cdn.simpleicons.org/mastercard/EB001B' },
    { id: 'elo',        name: 'Elo',              color: '#00A4E0', category: 'card', imageUrl: 'https://cdn.simpleicons.org/elo/00A4E0' },
    { id: 'amex',       name: 'American Express', color: '#007BC1', category: 'card', imageUrl: 'https://cdn.simpleicons.org/americanexpress/007BC1' },
    { id: 'hipercard',  name: 'Hipercard',        color: '#CC0000', category: 'card' },

    // Genéricos
    { id: 'generic-bank',   name: 'Outro Banco',         color: '#3B82F6', category: 'generic' },
    { id: 'generic-card',   name: 'Cartão de Crédito',   color: '#EF4444', category: 'generic' },
    { id: 'generic-wallet', name: 'Carteira Digital',    color: '#10B981', category: 'generic' },
    { id: 'money',          name: 'Dinheiro',            color: '#22C55E', category: 'generic' },
    { id: 'piggy-bank',     name: 'Poupança',            color: '#EC4899', category: 'generic' },
]

export function getBankLogo(id: string) {
    return BankLogos[id] || BankLogos['generic-bank']
}

export function isEmoji(str: string) {
    return /\p{Emoji}/u.test(str)
}
