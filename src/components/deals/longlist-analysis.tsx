"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
    LineChart,
    Line,
    CartesianGrid
} from "recharts";
import {
    Users,
    FileCheck,
    Zap,
    TrendingUp,
    Target,
    Activity,
    Search,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LonglistAnalysis({
    investors,
    dealId,
    documents
}: {
    investors: any[],
    dealId?: string,
    documents?: any[]
}) {
    // 1. Funnel Data calculation
    const contacted = investors.filter(i =>
        !["LONGLIST", "SHORTLIST", "REJECTED"].includes(i.status)
    ).length;

    const ndaSigned = investors.filter(i =>
        i.ndaSignedAt || ["NDA_SIGNED", "IM_SENT", "DATA_ROOM_ACCESS", "LOI", "BID_RECEIVED"].includes(i.status)
    ).length;

    const imSent = investors.filter(i =>
        i.imSentAt || ["IM_SENT", "DATA_ROOM_ACCESS", "LOI", "BID_RECEIVED"].includes(i.status)
    ).length;

    const bids = investors.filter(i => i.status === "BID_RECEIVED").length;

    const funnelData = [
        { name: "Longlist", value: investors.length, color: "#94a3b8" },
        { name: "Kontakt", value: contacted, color: "#3b82f6" },
        { name: "Signed NDA", value: ndaSigned, color: "#6366f1" },
        { name: "Info Memo", value: imSent, color: "#8b5cf6" },
        { name: "Angebote", value: bids, color: "#10b981" },
    ];

    // 2. Type Distribution calculation
    const typeDistribution = investors.reduce((acc: any, inv: any) => {
        const type = inv.organization?.type || "OTHER";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(typeDistribution).map(([key, val]) => ({
        name: key === 'FINANCIAL' ? 'Finanzivestor' : key === 'STRATEGIC' ? 'Stratege' : 'Sonstige',
        value: val
    }));

    // 3. Status KPIs
    const kpis = [
        { label: "Longlist Gesamt", value: investors.length, icon: Users, color: "text-slate-600", bg: "bg-slate-100" },
        { label: "In Kontakt", value: contacted, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Signed NDAs", value: ndaSigned, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Angebote", value: bids, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* KPI Overview Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-slate-200/60 shadow-sm overflow-hidden group hover:border-blue-300 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                                <div className="text-2xl font-black text-slate-900 tracking-tighter">{kpi.value}</div>
                            </div>
                            <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", kpi.bg)}>
                                <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Horizontal Funnel Analysis */}
                <Card className="lg:col-span-8 border-slate-200/60 shadow-sm bg-white/40 backdrop-blur-sm">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Prozess-Fortschritt (Funnel)
                            </CardTitle>
                            <span className="text-[10px] font-bold text-slate-300">Konvertierungs-Analyse</span>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Investor Type Pie */}
                <Card className="lg:col-span-4 border-slate-200/60 shadow-sm bg-white/40 backdrop-blur-sm">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            Investoren Struktur
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={50}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-[11px] font-bold text-slate-500 px-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Insight Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-80">Prozess Dynamik</h4>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black">{((ndaSigned / (contacted || 1)) * 100).toFixed(0)}%</span>
                            <span className="text-xs font-bold opacity-70">Rücklauf-Quote (NDA)</span>
                        </div>
                        <p className="text-xs leading-relaxed opacity-90 font-medium max-w-xs">
                            Basierend auf der aktuellen Kontaktierung haben {((ndaSigned / (contacted || 1)) * 100).toFixed(0)}% der angesprochenen Investoren die Vertraulichkeitsvereinbarung unterzeichnet.
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Status-Zusammenfassung</h4>
                    <div className="grid grid-cols-2 gap-y-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NDA Verhandlung</span>
                            <span className="text-xl font-black text-slate-800">{investors.filter(i => i.status === 'NDA_SENT').length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Erhaltene Angebote</span>
                            <span className="text-xl font-black text-emerald-600">{bids}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Abgelehnte Kontakte</span>
                            <span className="text-xl font-black text-rose-500">{investors.filter(i => i.status === 'REJECTED').length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Warten auf NDA</span>
                            <span className="text-xl font-black text-amber-500">{investors.filter(i => i.status === 'NDA_SENT' && !i.ndaSignedAt).length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
