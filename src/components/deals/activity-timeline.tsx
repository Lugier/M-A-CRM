"use client";

import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    User,
    MessageSquare,
    CheckCircle2,
    Phone,
    Mail,
    Clock,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { icon: any, color: string, label: string }> = {
    NOTE: { icon: MessageSquare, color: "bg-slate-100 text-slate-600", label: "Notiz" },
    DECISION: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Entscheidung" },
    CALL: { icon: Phone, color: "bg-blue-100 text-blue-700", label: "Anruf" },
    EMAIL: { icon: Mail, color: "bg-indigo-100 text-indigo-700", label: "E-Mail" },
    MEETING: { icon: Clock, color: "bg-amber-100 text-amber-700", label: "Meeting" },
    SYSTEM: { icon: AlertCircle, color: "bg-red-50 text-red-600", label: "System" },
};

export function ActivityTimeline({ activities }: { activities: any[] }) {
    if (activities.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400 italic bg-white/30 rounded-xl border border-dashed border-slate-200">
                Noch keine Aktivitäten geloggt.
            </div>
        );
    }

    const renderContent = (content: string) => {
        // Simple mention highlighter
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="font-bold text-blue-600 px-1 bg-blue-50 rounded select-all cursor-pointer hover:bg-blue-100 transition-colors">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:left-[19px] before:h-full before:w-px before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
            {activities.map((activity) => {
                const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.NOTE;
                const Icon = config.icon;

                return (
                    <div key={activity.id} className="relative flex items-start gap-4 group animate-in fade-in slide-in-from-left-4 duration-500">
                        {/* Avatar / Icon Circle */}
                        {activity.user ? (
                            <Link href={`/team/${activity.user.id}`} className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-all ring-4 ring-white hover:shadow-md hover:scale-105 duration-300 overflow-hidden group/avatar">
                                <div className="w-full h-full flex items-center justify-center text-[11px] font-bold text-white"
                                    style={{ backgroundColor: activity.user.avatarColor || '#cbd5e1' }}>
                                    {activity.user.initials}
                                </div>
                                {/* Type Indicator Mini-Icon */}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center z-20 ${config.color} shadow-sm`}>
                                    <Icon className="w-2.5 h-2.5" />
                                </div>
                            </Link>
                        ) : (
                            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm transition-all ring-4 ring-white overflow-hidden">
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                {/* Type Indicator Mini-Icon */}
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center z-20 ${config.color} shadow-sm`}>
                                    <Icon className="w-2.5 h-2.5" />
                                </div>
                            </div>
                        )}

                        <div className="flex-1 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-2">
                                    {activity.user ? (
                                        <Link href={`/team/${activity.user.id}`} className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors tracking-tight">
                                            {activity.user.name}
                                        </Link>
                                    ) : (
                                        <span className="font-bold text-slate-400 text-sm tracking-tight">
                                            System
                                        </span>
                                    )}
                                    <Badge variant="outline" className={`text-[10px] px-2 py-0 h-4.5 border-none font-bold tracking-tight uppercase ${config.color}`}>
                                        {config.label}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                    <Calendar className="w-3 h-3 opacity-60" />
                                    {new Date(activity.createdAt).toLocaleString("de-DE", {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="bg-white hover:bg-slate-50 transition-colors rounded-xl p-3.5 border border-slate-100 text-[13px] text-slate-700 leading-relaxed shadow-sm group-hover:shadow group-active:scale-[0.99] transition-all">
                                <div className="whitespace-pre-wrap">
                                    {renderContent(activity.content)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
