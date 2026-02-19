"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle2, Clock, Mail, Shield, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TeamMemberCardProps {
    user: any;
}

export function TeamMemberCard({ user }: TeamMemberCardProps) {
    const roleColors: Record<string, string> = {
        ADMIN: "bg-red-100 text-red-700 border-red-200",
        PARTNER: "bg-purple-100 text-purple-700 border-purple-200",
        DIRECTOR: "bg-blue-100 text-blue-700 border-blue-200",
        VP: "bg-indigo-100 text-indigo-700 border-indigo-200",
        ASSOCIATE: "bg-cyan-100 text-cyan-700 border-cyan-200",
        ANALYST: "bg-emerald-100 text-emerald-700 border-emerald-200",
        INTERN: "bg-slate-100 text-slate-700 border-slate-200",
    };

    return (
        <Link href={`/team/${user.id}`} className="block">
            <Card className="overflow-hidden border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group bg-white/50 backdrop-blur-sm">
                <CardHeader className="p-5 pb-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-2 ring-slate-50">
                                    <AvatarFallback style={{ backgroundColor: user.avatarColor }} className="text-white font-bold text-lg">
                                        {user.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                    <Badge className={cn("h-4 w-4 rounded-full p-0 flex items-center justify-center border-none", user.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500')}>
                                        <Shield className="h-2 w-2 text-white" />
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                    {user.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn("text-[10px] h-5 px-2 font-bold uppercase tracking-wider", roleColors[user.role] || "bg-slate-100 text-slate-700")}>
                                        {user.role}
                                    </Badge>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {user.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-4 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50/80 rounded-xl p-2.5 text-center border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all duration-300">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                <Briefcase className="w-3 h-3" /> Deals
                            </p>
                            <p className="text-lg font-black text-slate-900 leading-none">{user.stats.activeDealsCount}</p>
                        </div>
                        <div className="bg-slate-50/80 rounded-xl p-2.5 text-center border border-slate-100 group-hover:bg-emerald-50/50 group-hover:border-emerald-100 transition-all duration-300">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> Aufgaben
                            </p>
                            <p className="text-lg font-black text-slate-900 leading-none">{user.stats.totalTasksCount}</p>
                        </div>
                        <div className={cn(
                            "rounded-xl p-2.5 text-center border transition-all duration-300",
                            user.stats.overdueTasksCount > 0
                                ? "bg-red-50/80 border-red-100 group-hover:bg-red-50 group-hover:border-red-200"
                                : "bg-slate-50/80 border-slate-100 group-hover:bg-slate-100"
                        )}>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                <Clock className="w-3 h-3" /> Überfällig
                            </p>
                            <p className={cn("text-lg font-black leading-none", user.stats.overdueTasksCount > 0 ? "text-red-600" : "text-slate-900")}>
                                {user.stats.overdueTasksCount}
                            </p>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Aktive Projekte</h4>
                            <Badge variant="secondary" className="text-[9px] h-4 bg-blue-50 text-blue-600 font-bold uppercase tracking-tighter border-none">
                                {user.dealTeams.length} Gesamt
                            </Badge>
                        </div>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                            {user.dealTeams.map((dt: any) => (
                                <Link key={dt.deal.id} href={`/deals/${dt.deal.id}`}>
                                    <div className="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-blue-300 hover:shadow-sm transition-all group/item flex items-center justify-between mb-2">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-xs text-slate-900 truncate uppercase tracking-tight group-hover/item:text-blue-600">
                                                {dt.deal.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                    {dt.role}
                                                </span>
                                                <span className="text-[9px] text-slate-300 pr-1">•</span>
                                                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 py-0.5 rounded uppercase tracking-tighter">
                                                    {dt.deal.stage}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 ml-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center group-hover/item:bg-blue-50 transition-colors">
                                                <Briefcase className="w-2.5 h-2.5 text-slate-400 group-hover/item:text-blue-500" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {user.dealTeams.length === 0 && (
                                <div className="py-8 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <User className="w-8 h-8 text-slate-200 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keine aktiven Projekte</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deadlines Section */}
                    {user.assignedTasks.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Nächste Deadlines</h4>
                            <div className="space-y-1">
                                {user.assignedTasks.slice(0, 3).map((task: any) => (
                                    <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                        <span className="text-[11px] font-medium text-slate-700 truncate max-w-[150px]">
                                            {task.title}
                                        </span>
                                        {task.dueDate && (
                                            <span className={cn(
                                                "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                                                new Date(task.dueDate) < new Date() ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-600"
                                            )}>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
