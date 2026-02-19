"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Globe, MapPin, Building2, ChevronRight, Plus, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { addInvestorToDealAction } from "@/app/actions/deal-details";

interface Investor {
    id?: string;
    name: string;
    type: string;
    industryFocus: string;
    ticketSize: string;
    reasoning: string;
    website: string | null;
    location: string;
}

export function AiInvestorMatch({ dealId, dealName, industry }: {
    dealId: string;
    dealName: string;
    industry?: string;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

    async function handleSearch() {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "investor-match",
                    data: {
                        dealName,
                        industry: industry || null,
                        ticketSizeMin: null,
                        ticketSizeMax: null,
                        geographies: ["DACH"]
                    }
                })
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "AI-Anfrage fehlgeschlagen");
                return;
            }
            setInvestors(json.investors || []);
            if (json.investors?.length > 0) {
                toast.success(`${json.investors.length} passende Investoren gefunden!`);
            } else {
                toast.info("Keine Investoren gefunden.");
            }
        } catch (e) {
            toast.error("Verbindungsfehler zur AI");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAddToDeal(investor: Investor, index: number) {
        if (!investor.id) {
            toast.error("Fehler: Keine ID für diesen Investor gefunden.");
            return;
        }

        setAddingIds(prev => new Set(prev).add(index));
        try {
            const result = await addInvestorToDealAction(dealId, investor.id);

            if (result?.success) {
                setAddedIds(prev => new Set(prev).add(index));
                toast.success(`${investor.name} zur Longlist hinzugefügt`);
            } else {
                toast.error(result?.error || "Fehler beim Hinzufügen");
            }
        } catch (e) {
            toast.error("Verbindungsfehler");
        } finally {
            setAddingIds(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
        }
    }

    const typeColors: Record<string, string> = {
        "PE Fund": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "Strategisch": "bg-blue-100 text-blue-700 border-blue-200",
        "Family Office": "bg-amber-100 text-amber-700 border-amber-200",
        "VC": "bg-purple-100 text-purple-700 border-purple-200",
        "Andere": "bg-slate-100 text-slate-700 border-slate-200"
    };

    return (
        <div className="space-y-4">
            {/* AI Trigger */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-violet-900">AI Investor Matching</h3>
                            <p className="text-[11px] text-violet-500">GPT-5-mini analysiert mit Web Search passende Investoren für diesen Deal</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 min-w-[160px]"
                    >
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sucht Investoren...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> {hasSearched ? "Erneut suchen" : "Investoren finden"}</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-600/30 animate-pulse">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">AI recherchiert passende Investoren...</p>
                        <p className="text-xs text-slate-400 mt-1">Dies kann 10–30 Sekunden dauern</p>
                    </div>
                </div>
            )}

            {/* Results */}
            {!isLoading && investors.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{investors.length} Ergebnisse</p>
                    </div>
                    <div className="grid gap-3">
                        {investors.map((inv, i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-slate-900 truncate">{inv.name}</h4>
                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${typeColors[inv.type] || typeColors["Andere"]}`}>
                                                {inv.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                                            {inv.location && (
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inv.location}</span>
                                            )}
                                            {inv.industryFocus && (
                                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {inv.industryFocus}</span>
                                            )}
                                            {inv.ticketSize && (
                                                <span className="font-medium text-emerald-600">{inv.ticketSize}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">{inv.reasoning}</p>
                                        {inv.website && (
                                            <a href={inv.website.startsWith("http") ? inv.website : `https://${inv.website}`} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 mt-1.5">
                                                <ExternalLink className="w-3 h-3" /> {inv.website}
                                            </a>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={addedIds.has(i) ? "outline" : "default"}
                                        disabled={addingIds.has(i) || addedIds.has(i)}
                                        onClick={() => handleAddToDeal(inv, i)}
                                        className={addedIds.has(i)
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
                                            : "bg-blue-600 hover:bg-blue-700 text-white shadow"
                                        }
                                    >
                                        {addingIds.has(i) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : addedIds.has(i) ? (
                                            <><Check className="mr-1 h-3 w-3" /> Hinzugefügt</>
                                        ) : (
                                            <><Plus className="mr-1 h-3 w-3" /> Hinzufügen</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state after search */}
            {!isLoading && hasSearched && investors.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">Keine Investoren gefunden. Versuche es erneut.</p>
                </div>
            )}
        </div>
    );
}
