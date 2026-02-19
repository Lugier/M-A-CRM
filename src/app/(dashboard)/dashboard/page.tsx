import { getDeals } from "@/app/actions/deals";
import { getAnalyticsData } from "@/app/actions/analytics";
import { getUsers } from "@/app/actions/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUpRight, BarChart3, Briefcase, DollarSign, Plus, Search, TrendingUp, Users, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { PipelineOverview } from "@/components/pipeline/pipeline-overview";
import { Button } from "@/components/ui/button";

import { cookies } from "next/headers";

export default async function DashboardPage() {
    const deals = await getDeals();
    const analytics = await getAnalyticsData();
    const users = await getUsers();

    // Get current user from cookie
    const cookieStore = cookies();
    const currentUserId = cookieStore.get("crm_current_user")?.value;
    const currentUser = users.find((u: any) => u.id === currentUserId) || users[0];

    // Calculate quick stats
    const activeDeals = deals.filter((d: any) => d.status === "ACTIVE" && d.stage !== "ARCHIVED");
    const totalPipelineValue = activeDeals.reduce((sum: number, d: any) => sum + (d.feeSuccess || d.expectedValue || 0), 0);

    // Calculate NDA Conversion (Replacement for Win Rate)
    const ndaCount = deals.filter((d: any) =>
        d.investors?.some((i: any) => i.ndaSignedAt || i.status === "NDA_SIGNED")
    ).length;
    const ndaRate = deals.length > 0 ? (ndaCount / deals.length) * 100 : 0;

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-50/30">
            {/* Header */}
            <div className="flex-none p-4 lg:p-6 pb-2 lg:pb-3 flex items-center justify-between bg-white/40 backdrop-blur-sm border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Willkommen zurück! Hier ist der aktuelle Status der Mandate.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/deals">
                        <Button size="sm" className="h-9 text-xs bg-blue-600 hover:bg-blue-700 font-bold">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5" /> Zu den Mandaten
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Aktive Mandate"
                        value={activeDeals.length}
                        subtitle={`${deals.length} Projekte gesamt`}
                        icon={Briefcase}
                        color="blue"
                    />
                    <KPICard
                        title="Pipeline Volumen"
                        value={`${(totalPipelineValue / 1000000).toFixed(1)}M €`}
                        subtitle="Engagement Volumen Gesamt"
                        icon={DollarSign}
                        color="emerald"
                    />
                    <KPICard
                        title="NDA Rücklauf"
                        value={`${ndaRate.toFixed(0)}%`}
                        subtitle="Ø über alle Projekte"
                        icon={ShieldCheck}
                        color="indigo"
                    />
                    <KPICard
                        title="Aktive Nutzer"
                        value={`${users.length}`}
                        subtitle="Team Bachert"
                        icon={Users}
                        color="slate"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pipeline Overview */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 bg-slate-50/50 border-b px-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-blue-500" /> Pipeline Phasen
                                </CardTitle>
                                <Link href="/deals" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 flex items-center">
                                    Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
                                </Link>
                            </CardHeader>
                            <CardContent className="p-4">
                                <PipelineOverview deals={deals} />
                            </CardContent>
                        </Card>

                        {/* Recent Deals Activity */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 bg-slate-50/50 border-b px-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> Aktuelle Mandate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {deals.filter(d => d.status === 'ACTIVE').slice(0, 5).map((deal: any) => (
                                        <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-black text-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {deal.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 tracking-tight">{deal.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{deal.type}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{deal.stage}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs font-bold text-slate-900">{deal.feeSuccess ? `${(deal.feeSuccess / 1000).toFixed(0)}k €` : '–'}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Success Fee</p>
                                                </div>
                                                <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Column */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 bg-slate-50/50 border-b px-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Aktionen</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 grid grid-cols-2 gap-2">
                                <QuickAction href="/deals" icon={Briefcase} label="Neue Deal" color="blue" />
                                <QuickAction href="/contacts" icon={Users} label="Kontakt" color="emerald" />
                            </CardContent>
                        </Card>

                        {/* Team Progress */}
                        <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 bg-slate-50/50 border-b px-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-500" /> Team
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {users.sort((a: any, b: any) => (b.dealTeams?.length || 0) - (a.dealTeams?.length || 0)).slice(0, 20).map((user: any) => (
                                        <Link key={user.id} href={`/team/${user.id}`} className="flex items-center gap-3 p-4 group hover:bg-slate-50 transition-colors">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-white shadow-sm shrink-0 transition-transform group-hover:scale-110"
                                                style={{ backgroundColor: user.avatarColor }}
                                            >
                                                {user.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <p className="text-xs font-black text-slate-700 truncate group-hover:text-blue-600 transition-colors">{user.name}</p>
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                        {user.dealTeams?.length || 0} Mandate
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${(user.dealTeams?.length || 0) > 4 ? 'bg-rose-500' :
                                                            (user.dealTeams?.length || 0) > 2 ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${Math.min((user.dealTeams?.length || 0) * 20, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, subtitle, icon: Icon, color }: any) {
    const colorMap: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        amber: "bg-amber-50 text-amber-600 border-amber-200",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
        rose: "bg-rose-50 text-rose-600 border-rose-200",
        slate: "bg-slate-100 text-slate-600 border-slate-200",
    };

    return (
        <Card className="border-slate-200/60 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-white/70">
            <CardContent className="p-5 flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-bold uppercase tracking-tight">{subtitle}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
                    <Icon className="w-5 h-5 shadow-sm" />
                </div>
            </CardContent>
        </Card>
    );
}

function QuickAction({ href, icon: Icon, label, color }: any) {
    const colorMap: Record<string, string> = {
        emerald: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200",
        blue: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200",
        amber: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200",
        indigo: "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200",
        rose: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200",
    };

    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm transition-all text-slate-600 font-black tracking-widest ${colorMap[color]}`}
        >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-[10px] uppercase">{label}</span>
        </Link>
    );
}
