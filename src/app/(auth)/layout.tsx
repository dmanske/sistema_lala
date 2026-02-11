import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - Lala System",
    description: "Sign in to your salon management account",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50">
            {children}
        </div>
    );
}
