"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Activity as ActivityIcon, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function OrganizationFeed({ activities, comments }: { activities: any[], comments: any[] }) {
    // Combine and sort by date
    const feedItems = [
        ...activities.map(a => ({ ...a, feedType: 'activity' })),
        ...comments.map(c => ({ ...c, feedType: 'comment' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                    <ActivityIcon className="w-5 h-5 text-emerald-500" />
                    Unternehmens-Feed / Historie
                </h2>
            </div>

            <div className="relative space-y-4">
                {/* Timeline Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block" />

                {feedItems.map((item) => (
                    <div key={item.id} className="relative flex gap-4 items-start group">
                        {/* Feed Icon Container */}
                        <div className="md:w-14 items-center justify-center hidden md:flex shrink-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center relative z-10 shadow-sm border border-white transition-transform group-hover:scale-110 ${item.feedType === 'comment' ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
                                }`}>
                                {item.feedType === 'comment' ? <MessageSquare className="w-5 h-5" /> : <ActivityIcon className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 bg-white rounded-[30px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{item.user?.name || "Unbekannter User"}</span>
                                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 bg-slate-100 text-slate-500 border-none">
                                        {item.feedType === 'comment' ? 'Kommentar' : item.type || 'Aktivität'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        {format(new Date(item.createdAt), "dd. MMM yyyy, HH:mm", { locale: de })}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                {item.content}
                            </p>
                        </div>
                    </div>
                ))}

                {feedItems.length === 0 && (
                    <div className="py-20 text-center rounded-[40px] border-2 border-dashed border-slate-100 bg-white/50">
                        <ActivityIcon className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Noch keine Aktivitäten in diesem Unternehmen</p>
                    </div>
                )}
            </div>
        </div>
    );
}
