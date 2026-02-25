import {
    Building2,
    CreditCard,
    Wallet,
    PiggyBank,
    Banknote,
    QrCode
} from 'lucide-react'

export const BankLogos: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    // Generic
    'generic-bank': (props) => <Building2 {...props} />,
    'generic-card': (props) => <CreditCard {...props} />,
    'generic-wallet': (props) => <Wallet {...props} />,
    'piggy-bank': (props) => <PiggyBank {...props} />,

    // Real Bank Logos - Simplified but recognizable
    'nubank': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Nubank's iconic "N" shape */}
            <path d="M8 28a1.5 1.5 0 0 1-1.5-1.5V7.2a1.5 1.5 0 0 1 2.32-1.25l10.36 6.9V5.5A1.5 1.5 0 0 1 20.68 4h3.75a1.5 1.5 0 0 1 1.5 1.5v19.3a1.5 1.5 0 0 1-2.32 1.25l-10.36-6.9v7.35A1.5 1.5 0 0 1 11.75 28H8Z" />
        </svg>
    ),
    'inter': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Inter's square with rounded corners */}
            <rect x="4" y="4" width="24" height="24" rx="4" fill="currentColor" opacity="0.15" />
            <path d="M10 12h3v8h-3v-8Zm9 0h3v8h-3v-8Z" />
        </svg>
    ),
    'itau': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Itaú's iconic cube/square design */}
            <rect x="4" y="4" width="24" height="24" rx="3" fill="currentColor" opacity="0.15" />
            <path d="M15 10h2v12h-2V10Z" />
            <path d="M11 14h2v6h-2v-6Zm8 0h2v6h-2v-6Z" />
            <rect x="11" y="21" width="10" height="2" />
        </svg>
    ),
    'bradesco': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Bradesco's triangle/pyramid */}
            <path d="M16 6L6 24h20L16 6Zm0 5.5L21.5 22h-11L16 11.5Z" />
        </svg>
    ),
    'santander': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Santander's flame symbol */}
            <path d="M16 4C10.5 4 6 8.5 6 14c0 3.5 1.8 6.6 4.5 8.4.3.2.5.5.5.9v2.2c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5v-2.2c0-.4.2-.7.5-.9C24.2 20.6 26 17.5 26 14c0-5.5-4.5-10-10-10Zm0 3c3.9 0 7 3.1 7 7 0 2.4-1.2 4.5-3 5.8v2.7h-8v-2.7c-1.8-1.3-3-3.4-3-5.8 0-3.9 3.1-7 7-7Z" />
            <ellipse cx="16" cy="14" rx="3" ry="4" fill="white" opacity="0.3" />
        </svg>
    ),
    'bb': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Banco do Brasil's double B */}
            <rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" opacity="0.15" />
            <path d="M10 8h5c2.2 0 4 1.3 4 3s-1.8 3-4 3h-2v2h2c2.2 0 4 1.3 4 3s-1.8 3-4 3h-5V8Zm3 2v3h2c.6 0 1-.4 1-1.5S15.6 10 15 10h-2Zm0 7v3h2c.6 0 1-.4 1-1.5s-.4-1.5-1-1.5h-2Z" />
            <path d="M19 8h5c2.2 0 4 1.3 4 3s-1.8 3-4 3h-2v2h2c2.2 0 4 1.3 4 3s-1.8 3-4 3h-5V8Zm3 2v3h2c.6 0 1-.4 1-1.5S24.6 10 24 10h-2Zm0 7v3h2c.6 0 1-.4 1-1.5s-.4-1.5-1-1.5h-2Z" />
        </svg>
    ),
    'caixa': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Caixa's house/roof symbol */}
            <path d="M16 4L4 12v2h2v12h20V14h2v-2L16 4Zm0 3.5L24 13v11H8V13l8-5.5Z" />
            <path d="M12 18h8v6h-8v-6Z" />
        </svg>
    ),
    'c6': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* C6 Bank's C and 6 */}
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.15" />
            <path d="M16 6C10.5 6 6 10.5 6 16s4.5 10 10 10c2.8 0 5.3-1.1 7.2-3l-1.4-1.4c-1.5 1.5-3.6 2.4-5.8 2.4-4.4 0-8-3.6-8-8s3.6-8 8-8c2.2 0 4.3.9 5.8 2.4l1.4-1.4C21.3 7.1 18.8 6 16 6Z" />
            <path d="M22 12h4v2h-4v-2Zm0 4h4v2h-4v-2Z" />
        </svg>
    ),
    'picpay': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* PicPay's P symbol in a rounded square */}
            <rect x="4" y="8" width="24" height="16" rx="4" fill="currentColor" opacity="0.15" />
            <path d="M12 12h6c2.2 0 4 1.8 4 4s-1.8 4-4 4h-3v4h-3V12Zm3 3v4h3c.6 0 1-.4 1-2s-.4-2-1-2h-3Z" />
        </svg>
    ),
    'mp': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Mercado Pago's handshake/payment symbol */}
            <path d="M8 12h6v2H8v-2Zm10 0h6v2h-6v-2Z" />
            <path d="M6 16c0-1.1.9-2 2-2h4v8H8c-1.1 0-2-.9-2-2v-4Zm14-2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4v-8h4Z" />
            <circle cx="16" cy="18" r="3" fill="white" opacity="0.3" />
        </svg>
    ),
    'money': (props) => <Banknote {...props} />,
    
    // Additional Brazilian Banks
    'sicoob': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Sicoob's cooperative symbol */}
            <circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.15" />
            <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8Zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6Z" />
            <circle cx="12" cy="14" r="1.5" />
            <circle cx="20" cy="14" r="1.5" />
            <circle cx="16" cy="18" r="1.5" />
        </svg>
    ),
    'sicredi': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Sicredi's leaf/growth symbol */}
            <path d="M16 4C10 4 6 8 6 14c0 4 2 7 4 9l6 5 6-5c2-2 4-5 4-9 0-6-4-10-10-10Zm0 3c4.4 0 7 2.7 7 7 0 2.8-1.4 5-3 6.5l-4 3.5-4-3.5c-1.6-1.5-3-3.7-3-6.5 0-4.3 2.6-7 7-7Z" />
            <path d="M16 10c-2.2 0-4 1.8-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.4 1.5-1 1.9l-1 .6c-.6.4-1 1-1 1.7V20h2v-1.2l.6-.4c1-.6 1.4-1.7 1.4-2.8 0-2.2-1.8-4-4-4Z" />
        </svg>
    ),
    'original': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Banco Original's modern O */}
            <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="6" fill="currentColor" opacity="0.3" />
        </svg>
    ),
    'safra': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Banco Safra's S symbol */}
            <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4Zm4 18c0 2.2-1.8 4-4 4s-4-1.8-4-4h2c0 1.1.9 2 2 2s2-.9 2-2c0-.8-.5-1.5-1.2-1.8L14 19c-1.7-.8-2.8-2.5-2.8-4.4 0-2.2 1.8-4 4-4s4 1.8 4 4h-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 .8.5 1.5 1.2 1.8l2.8 1.2c1.7.8 2.8 2.5 2.8 4.4Z" />
        </svg>
    ),
    'btg': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* BTG Pactual's modern design */}
            <rect x="4" y="4" width="24" height="24" rx="2" fill="currentColor" opacity="0.1" />
            <path d="M10 10h6c2.2 0 4 1.8 4 4 0 1.3-.6 2.4-1.5 3.2 1.4.8 2.5 2.3 2.5 4 0 2.8-2.2 5-5 5h-6V10Zm3 3v4h3c.6 0 1-.4 1-2s-.4-2-1-2h-3Zm0 7v4h3c1.1 0 2-.9 2-2s-.9-2-2-2h-3Z" />
        </svg>
    ),
    'neon': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Neon's lightning bolt */}
            <path d="M18 4l-10 14h8l-2 10 10-14h-8l2-10Z" opacity="0.3" />
            <path d="M18 4l-10 14h8l-2 10 10-14h-8l2-10Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    'next': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Banco Next's arrow/forward symbol */}
            <path d="M8 16l8-8v5h8v6h-8v5l-8-8Z" />
            <path d="M20 13h4v6h-4v-6Z" opacity="0.5" />
        </svg>
    ),
    'will': (props) => (
        <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
            {/* Will Bank's W */}
            <path d="M6 8l4 16h3l3-10 3 10h3l4-16h-3l-2.5 10L18 8h-4l-2.5 10L9 8H6Z" />
        </svg>
    ),
}

export const BANK_PRESETS = [
    { id: 'nubank', name: 'Nubank', color: '#8A05BE' },
    { id: 'inter', name: 'Inter', color: '#FF7A00' },
    { id: 'itau', name: 'Itaú', color: '#EC7000' },
    { id: 'bradesco', name: 'Bradesco', color: '#CC092F' },
    { id: 'santander', name: 'Santander', color: '#EC0000' },
    { id: 'bb', name: 'Banco do Brasil', color: '#FFDD00' },
    { id: 'caixa', name: 'Caixa Econômica', color: '#0066B3' },
    { id: 'c6', name: 'C6 Bank', color: '#000000' },
    { id: 'btg', name: 'BTG Pactual', color: '#1A1A1A' },
    { id: 'safra', name: 'Banco Safra', color: '#003366' },
    { id: 'original', name: 'Banco Original', color: '#00D959' },
    { id: 'sicoob', name: 'Sicoob', color: '#00A859' },
    { id: 'sicredi', name: 'Sicredi', color: '#00A859' },
    { id: 'neon', name: 'Neon', color: '#00E9FF' },
    { id: 'next', name: 'Banco Next', color: '#00D959' },
    { id: 'will', name: 'Will Bank', color: '#FF6B00' },
    { id: 'picpay', name: 'PicPay', color: '#21C25E' },
    { id: 'mp', name: 'Mercado Pago', color: '#009EE3' },
    { id: 'generic-bank', name: 'Outro Banco', color: '#3B82F6' },
    { id: 'generic-card', name: 'Cartão de Crédito', color: '#EF4444' },
    { id: 'generic-wallet', name: 'Carteira Digital', color: '#10B981' },
    { id: 'money', name: 'Dinheiro', color: '#22C55E' },
    { id: 'piggy-bank', name: 'Poupança/Investimento', color: '#EC4899' },
]

export function getBankLogo(id: string) {
    return BankLogos[id] || BankLogos['generic-bank']
}

export function isEmoji(str: string) {
    return /\p{Emoji}/u.test(str)
}
