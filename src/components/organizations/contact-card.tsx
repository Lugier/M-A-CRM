"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";

interface ContactCardProps {
    contact: {
        id: string;
        firstName: string;
        lastName: string;
        role?: string;
        email?: string;
    }
}

export function ContactCard({ contact }: ContactCardProps) {
    return (
        <Link href={`/contacts/${contact.id}`} className="block">
            <Card className="border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer h-full">
                <CardContent className="p-3 lg:p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        {contact.lastName.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors tracking-tight">
                            {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate font-black uppercase tracking-widest mt-0.5">
                            {contact.role || "Ansprechpartner"}
                        </p>
                    </div>
                    {contact.email && (
                        <a
                            href={`mailto:${contact.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors z-10"
                            title={contact.email}
                        >
                            <Mail className="w-4 h-4" />
                        </a>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
