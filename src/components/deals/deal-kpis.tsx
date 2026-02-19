"use client";

import { useState, useTransition } from "react";
import { updateDealAction } from "@/app/actions/deal-details";
import { Euro, Users, BarChart3, Building2, Save, Loader2, Globe, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const OWNER_LABELS: Record<string, string> = {
    FOUNDER_LED: "Gründergeführt",
    FAMILY_OWNED: "Familienunternehmen",
    PE_BACKED: "PE-backed",
    CORPORATE: "Konzern",
    PUBLIC: "Börsennotiert",
    OTHER: "Sonstige",
};

export function DealKPIs({ deal }: { deal: any }) {
    const [editing, setEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [description, setDescription] = useState(deal.description || "");
    const [website, setWebsite] = useState(deal.website || "");
    const [revenue, setRevenue] = useState(deal.targetRevenue?.toString() || "");
    const [ebitda, setEbitda] = useState(deal.targetEbitda?.toString() || "");
    const [employees, setEmployees] = useState(deal.targetEmployees?.toString() || "");
    const [subIndustry, setSubIndustry] = useState(deal.targetSubIndustry || "");
    const [ownerStructure, setOwnerStructure] = useState(deal.ownerStructure || "");
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleAiResearch = async () => {
        if (!website) {
            toast.error("Bitte geben Sie zuerst eine Website-URL ein.");
            return;
        }

        setIsAiLoading(true);
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "org-from-website",
                    data: { websiteUrl: website }
                })
            });

            const aiResponse = await res.json();
            if (aiResponse.error) throw new Error(aiResponse.error);

            const org = aiResponse.orgData;
            if (org) {
                if (org.description) setDescription(org.description);
                if (org.revenue) setRevenue(org.revenue.toString());
                if (org.ebitda) setEbitda(org.ebitda.toString());
                if (org.employees) setEmployees(org.employees.toString());
                if (org.industry) setSubIndustry(org.industry);
                toast.success("Daten erfolgreich mit KI generiert!");
            }
        } catch (e: any) {
            toast.error("KI-Recherche fehlgeschlagen: " + e.message);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateDealAction(deal.id, {
                description,
                website,
                targetRevenue: revenue ? parseFloat(revenue) : null,
                targetEbitda: ebitda ? parseFloat(ebitda) : null,
                targetEmployees: employees ? parseInt(employees) : null,
                targetSubIndustry: subIndustry || null,
                ownerStructure: ownerStructure || null,
            });

            if (result?.success) {
                setEditing(false);
                toast.success("Änderungen gespeichert");
            } else {
                toast.error(result?.error || "Fehler beim Speichern");
            }
        });
    };

    if (!editing) {
        return (
            <div className="space-y-4">
                {/* Description & Website */}
                <div className="bg-white/60 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Beschreibung</h4>
                        <Button variant="ghost" size="sm" className="text-[10px] h-6 text-blue-600" onClick={() => setEditing(true)}>Bearbeiten</Button>
                    </div>
                    {deal.website && (
                        <div className="mb-3">
                            <a href={deal.website.startsWith('http') ? deal.website : `https://${deal.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 w-fit">
                                <Globe className="w-3.5 h-3.5" />
                                {deal.website.replace(/^https?:\/\/(www\.)?/, '')}
                                <ExternalLink className="w-3 h-3 opacity-50" />
                            </a>
                        </div>
                    )}
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {deal.description || <span className="text-slate-400 italic">Keine Beschreibung vorhanden. Klicken Sie auf Bearbeiten.</span>}
                    </p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white/60 rounded-xl p-3 border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Euro className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Umsatz</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                            {deal.targetRevenue ? `${(deal.targetRevenue / 1000000).toFixed(1)}M €` : "–"}
                        </p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">EBITDA</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">
                            {deal.targetEbitda ? `${(deal.targetEbitda / 1000000).toFixed(1)}M €` : "–"}
                        </p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mitarbeiter</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{deal.targetEmployees || "–"}</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-3 border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Eigentümer</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                            {deal.ownerStructure ? OWNER_LABELS[deal.ownerStructure] || deal.ownerStructure : "–"}
                        </p>
                    </div>
                </div>

                {deal.targetSubIndustry && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subsegment:</span>
                        <Badge variant="outline" className="text-[10px]">{deal.targetSubIndustry}</Badge>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Deal bearbeiten</h4>
                <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleAiResearch}
                    disabled={isAiLoading || !website}
                    className="h-7 text-[10px] bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-100 font-bold"
                >
                    {isAiLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                    ) : (
                        <Sparkles className="w-3 h-3 mr-1.5" />
                    )}
                    Mit KI generieren
                </Button>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Beschreibung</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                        placeholder="Kurzbeschreibung des Targets..."
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Website</label>
                    <div className="flex gap-2">
                        <Input
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            placeholder="www.beispiel.de"
                            className="h-9 flex-1"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Umsatz (€)</label>
                    <Input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="z.B. 5000000" className="h-9" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">EBITDA (€)</label>
                    <Input type="number" value={ebitda} onChange={e => setEbitda(e.target.value)} placeholder="z.B. 1000000" className="h-9" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Mitarbeiter</label>
                    <Input type="number" value={employees} onChange={e => setEmployees(e.target.value)} placeholder="z.B. 50" className="h-9" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Eigentümer</label>
                    <select
                        value={ownerStructure}
                        onChange={e => setOwnerStructure(e.target.value)}
                        className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Auswählen...</option>
                        {Object.entries(OWNER_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Subsegment</label>
                <Input value={subIndustry} onChange={e => setSubIndustry(e.target.value)} placeholder="z.B. SaaS, Maschinenbau, Medizintechnik..." className="h-9" />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Abbrechen</Button>
                <Button size="sm" onClick={handleSave} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    Speichern
                </Button>
            </div>
        </div>
    );
}
