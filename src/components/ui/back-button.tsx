"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    label?: string;
    className?: string;
    iconClassName?: string;
    variant?: "default" | "ghost" | "outline" | "premium";
}

export function BackButton({
    label = "Zurück",
    className,
    iconClassName,
    variant = "default"
}: BackButtonProps) {
    const router = useRouter();

    if (variant === "premium") {
        return (
            <button
                onClick={() => router.back()}
                className={cn(
                    "flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all w-fit group",
                    className
                )}
            >
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:border-blue-200 group-hover:shadow-md transition-all">
                    <ArrowLeft className={cn("w-4 h-4 group-hover:-translate-x-1 transition-transform", iconClassName)} />
                </div>
                <span className="text-xs font-black tracking-[0.2em] uppercase ml-1">{label}</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => router.back()}
            className={cn(
                "flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 text-xs font-bold uppercase tracking-widest group",
                className
            )}
        >
            <ArrowLeft className={cn("w-4 h-4 group-hover:-translate-x-1 transition-transform", iconClassName)} />
            {label}
        </button>
    );
}
