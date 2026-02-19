import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Bachert DealFlow - M&A CRM",
    description: "Next-Gen M&A Deal Management",
};

import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de" suppressHydrationWarning>
            <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
                {children}
                <Toaster position="bottom-right" richColors closeButton />
            </body>
        </html>
    );
}
