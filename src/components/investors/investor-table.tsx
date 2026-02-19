"use client";

import { useState } from "react";
import { Building2, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";

type InvestorOrg = {
    id: string;
    name: string;
    industry: string | null;
    type: string;
    ticketSizeMin: number | null;
    ticketSizeMax: number | null;
    aum: number | null;
    geographies: string[];
    _count: { contacts: number; investorDeals: number };
};

function formatMoney(val: number | null): string {
    if (!val) return "—";
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} Mrd. €`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}M €`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K €`;
    return `${val} €`;
}

export function InvestorTable({
    investors,
    allOrganizations,
}: {
    investors: InvestorOrg[];
    allOrganizations: InvestorOrg[];
}) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    const filtered = investors.filter((inv) => {
        const matchesSearch =
            inv.name.toLowerCase().includes(search.toLowerCase()) ||
            (inv.industry || "").toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "ALL" || inv.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Suche nach Name, Industrie..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTypeFilter("ALL")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === "ALL"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                                }`}
                        >
                            Alle
                        </button>
                        {Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setTypeFilter(value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${typeFilter === value
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 font-medium">Firma</th>
                            <th className="px-6 py-3 font-medium">Typ</th>
                            <th className="px-6 py-3 font-medium">Fokus</th>
                            <th className="px-6 py-3 font-medium">Ticket (Min-Max)</th>
                            <th className="px-6 py-3 font-medium">AUM</th>
                            <th className="px-6 py-3 font-medium">Deals</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((inv) => (
                            <tr
                                key={inv.id}
                                className="bg-white hover:bg-slate-50/80 transition-colors group"
                            >
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    <Link
                                        href={`/organizations/${inv.id}`}
                                        className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        {inv.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant="secondary"
                                        className="bg-slate-100 text-slate-600 border-none text-[10px] font-bold uppercase"
                                    >
                                        {ORGANIZATION_TYPE_LABELS[inv.type] || inv.type}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {inv.industry || "—"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {inv.ticketSizeMin || inv.ticketSizeMax
                                        ? `${formatMoney(inv.ticketSizeMin)} - ${formatMoney(inv.ticketSizeMax)}`
                                        : "—"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {formatMoney(inv.aum)}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {inv._count.investorDeals}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="font-medium text-lg">Keine Investoren gefunden</p>
                        <p className="text-sm mt-1">
                            Legen Sie Organisationen mit dem Typ &quot;Buyer&quot;, &quot;VC&quot; oder &quot;PE Fund&quot; an.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
