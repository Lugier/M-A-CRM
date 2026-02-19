"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, Briefcase, Euro, CheckSquare, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = {
    "briefcase": Briefcase,
    "euro": Euro,
    "check-square": CheckSquare,
    "trending-up": TrendingUp,
};

interface KPICardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    delay?: number;
}

export function KPICard({ title, value, description, icon, trend, trendValue, delay = 0 }: KPICardProps) {
    const Icon = ICONS[icon] || HelpCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4 }}
            className="group relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 lg:p-6 border border-white/20 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
        >
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-500" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="p-2.5 bg-blue-600/10 dark:bg-blue-400/10 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-inherit" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest",
                        trend === "up" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            trend === "down" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                                "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                    )}>
                        {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                        {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                        {trend === "neutral" && <Minus className="w-3 h-3" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-0.5 tracking-tight">
                    {value}
                </div>
                {description && (
                    <p className="text-slate-400 text-[10px] font-medium">{description}</p>
                )}
            </div>
        </motion.div>
    );
}

