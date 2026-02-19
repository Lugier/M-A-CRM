"use client";

import { BarChart3, TrendingUp, Clock, Target, Users, Briefcase, DollarSign, ArrowUpRight, ArrowDownRight, Minus, Filter, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAGE_LABELS: Record<string, string> = {
    PITCH: "Pitch",
    KICKOFF: "Kickoff",
    LL: "LL",
    TEASER: "Teaser",
    NDA: "NDA",
    IM: "IM",
    PROZESSBRIEF: "Prozessbrief",
    MP: "MP",
    NBO: "NBO",
    CLOSING: "Closing",
    ARCHIVED: "Archiviert"
};

export function AnalyticsDashboard({ data }: { data: any }) {
    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 bg-white border-b border-slate-200 flex-none">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Mandats-Cockpit</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time Deal Flow & Performance</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-20">
                {/* Top KPIs - Premium Style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Gewichtete Fees"
                        value={`${(data.weightedSuccessFees / 1000).toFixed(0)}k €`}
                        subtitle={`Potential: ${(data.potentialFees / 1000).toFixed(0)}k €`}
                        icon={DollarSign}
                        color="blue"
                    />
                    <KPICard
                        title="Booked Fees (YTD)"
                        value={`${(data.bookedFees / 1000).toFixed(0)}k €`}
                        subtitle="Abgeschlossen"
                        icon={TrendingUp}
                        color="emerald"
                    />
                    <KPICard
                        title="NDA Rücklauf-Quote"
                        value={`${data.ndaConversionRate}%`}
                        subtitle="Prozess-Effizienz"
                        icon={ShieldCheck}
                        color="indigo"
                    />
                    <KPICard
                        title="Durchschn. Laufzeit"
                        value={`${data.avgDealDuration} Tage`}
                        subtitle="Mandat bis Closing"
                        icon={Clock}
                        color="slate"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Growth Chart */}
                    <Card className="col-span-2 border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader className="py-4 border-b border-slate-100/50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-500" />
                                Erfolgshonorar-Entwicklung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="flex items-end gap-x-3 h-60">
                                {data.monthlyGrowth.map((m: any) => {
                                    const maxRev = Math.max(...data.monthlyGrowth.map((t: any) => t.revenue), 100000);
                                    const height = (m.revenue / maxRev) * 100;
                                    return (
                                        <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer h-full justify-end">
                                            <div className="w-full flex-1 flex items-end justify-center relative">
                                                <div
                                                    className="w-full bg-slate-900/90 rounded-t-md group-hover:bg-blue-600 transition-all duration-500 relative mx-1 shadow-sm"
                                                    style={{ height: `${Math.max(height, 4)}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 font-black shadow-xl">
                                                        {(m.revenue / 1000).toFixed(0)}k €
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.month}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Funnel / Conversion */}
                    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
                        <CardHeader className="py-4 border-b border-slate-100/50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-500" />
                                Aggregierter Deal-Funnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {data.funnelData.map((step: any, i: number) => {
                                const maxCount = Math.max(...data.funnelData.map((s: any) => s.count), 1);
                                const width = (step.count / maxCount) * 100;
                                return (
                                    <div key={step.stage} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span>{step.stage}</span>
                                            <span className="text-slate-900">{step.count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-inner dark:from-blue-600 dark:to-indigo-700"
                                                style={{ width: `${Math.max(width, 1)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Investoren-Aktivität</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center group hover:border-blue-200 transition-colors">
                                        <div className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{data.investorStats.ndaSigned}</div>
                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">NDAs Unterzeichnet</div>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center group hover:border-emerald-200 transition-colors">
                                        <div className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{data.investorStats.bidsReceived}</div>
                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Angebote Erhalten</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, subtitle, icon: Icon, color }: { title: string; value: any; subtitle: string; icon: any; color: string }) {
    const colorStyles: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };

    return (
        <Card className="border-slate-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/70">
            <CardContent className="p-5 flex flex-col items-start gap-4">
                <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{value}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{title}</p>
                    {subtitle && <p className="text-[10px] text-slate-400 mt-2 font-bold">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
