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

    // Stylized Brands 
    'nubank': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M7 21a1 1 0 0 1-1-1V5.4a1 1 0 0 1 1.55-.83l6.9 4.6V4a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1v15.6a1 1 0 0 1-1.55.83l-6.9-4.6V20a1 1 0 0 1-1 1H7Z" />
            <path d="M7 21h3.5v-7l-3.5-2.4V21Z" fillOpacity="0.75" />
        </svg>
    ),
    'inter': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M3 4h18v16H3V4Zm2 2v12h14V6H5Zm2 3h3v6H7V9Zm7 0h3v6h-3V9Z" /> {/* Simplified Inter */}
        </svg>
    ),
    'itau': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <rect x="2" y="2" width="20" height="20" rx="4" opacity="0.2" />
            <path d="M11 7v10h2V7h-2Zm-3 3v4h1v-4H8Zm6 0v4h2v-4h-2Zm-6 5h8v2H8v-2Z" />
        </svg>
    ),
    'bradesco': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M4 18h16L12 3 4 18Zm4-2l4-7.5 4 7.5H8Z" />
            <path d="M6 21h12v-2H6v2Z" />
        </svg>
    ),
    'santander': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M2.5 12c0-5.25 4.25-9.5 9.5-9.5s9.5 4.25 9.5 9.5-4.25 9.5-9.5 9.5-9.5-4.25-9.5-9.5Zm13-3a3.5 3.5 0 0 0-7 0v2.5H6.5v2H11v3.5a3.5 3.5 0 0 0 7 0v-8Z" fillRule="evenodd" />
            <path d="M14.5 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" fill="white" />
        </svg>
    ),
    'bb': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M4 4h16v16H4V4Zm3 3v10h4c2 0 3-1 3-3V9h-2v4H9V7H7Zm6 0v10h4c2 0 3-1 3-3V9h-2v4h-2V7h-3Z" />
        </svg>
    ),
    'caixa': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M20.5 4L12 11.5 3.5 4 2 5.5 12 14.5l10-9L20.5 4Z" />
            <path d="M20.5 10.5 12 18 3.5 10.5 2 12l10 9 10-9-1.5-1.5Z" />
        </svg>
    ),
    'c6': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Zm-2 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5Zm8-5h-4v-1h4v1Z" />
        </svg>
    ),
    'picpay': (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M21 6H8a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5h13a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm-1 9H8a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h11v8Z" />
            <path d="M9 9h4v6H9V9Z" />
        </svg>
    ),
    'mp': (props) => ( // Mercado Pago simplified: Handshake
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M14 6h-4v2h4V6zm-4 4h4v2h-4v-2zm-6 2l3 3 6-6 4 4 3-3-9-9-9 9 2 2z" />
        </svg>
    ),
    'money': (props) => <Banknote {...props} />,
}

export const BANK_PRESETS = [
    { id: 'nubank', name: 'Nubank', color: '#8A05BE' },
    { id: 'inter', name: 'Inter', color: '#FF7A00' },
    { id: 'itau', name: 'Itaú', color: '#EC7000' },
    { id: 'bradesco', name: 'Bradesco', color: '#CC092F' },
    { id: 'santander', name: 'Santander', color: '#EC0000' },
    { id: 'bb', name: 'Banco do Brasil', color: '#F8D117' },
    { id: 'caixa', name: 'Caixa', color: '#0066B3' },
    { id: 'c6', name: 'C6 Bank', color: '#2C2C2C' },
    { id: 'picpay', name: 'PicPay', color: '#21C25E' },
    { id: 'mp', name: 'Mercado Pago', color: '#009EE3' },
    { id: 'generic-bank', name: 'Banco', color: '#3B82F6' },
    { id: 'generic-card', name: 'Cartão', color: '#EF4444' },
    { id: 'generic-wallet', name: 'Carteira', color: '#10B981' },
    { id: 'money', name: 'Dinheiro', color: '#22C55E' },
    { id: 'piggy-bank', name: 'Investimento', color: '#EC4899' },
]

export function getBankLogo(id: string) {
    return BankLogos[id] || BankLogos['generic-bank']
}

export function isEmoji(str: string) {
    return /\p{Emoji}/u.test(str)
}
