"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { createDealAction } from "@/app/actions/create-deal";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export function CreateDealDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [type, setType] = useState("SELL_SIDE");
    const [website, setWebsite] = useState("");
    const [description, setDescription] = useState("");
    const [expectedValue, setExpectedValue] = useState("");
    const [probability, setProbability] = useState("0.1");
    const [targetRevenue, setTargetRevenue] = useState("");
    const [targetEbitda, setTargetEbitda] = useState("");
    const [targetEmployees, setTargetEmployees] = useState("");
    const [targetSubIndustry, setTargetSubIndustry] = useState("");

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
                if (org.name && !name) setName(org.name);
                if (org.description) setDescription(org.description);
                if (org.revenue) setTargetRevenue(org.revenue.toString());
                if (org.ebitda) setTargetEbitda(org.ebitda.toString());
                if (org.employees) setTargetEmployees(org.employees.toString());
                if (org.industry) setTargetSubIndustry(org.industry);
                toast.success("Daten erfolgreich mit KI generiert!");
            }
        } catch (e: any) {
            toast.error("KI-Recherche fehlgeschlagen: " + e.message);
        } finally {
            setIsAiLoading(false);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsPending(true);

        try {
            const formData = new FormData();
            formData.set("name", name);
            formData.set("type", type);
            formData.set("website", website);
            formData.set("description", description);
            formData.set("expectedValue", expectedValue);
            formData.set("probability", probability);
            formData.set("targetRevenue", targetRevenue);
            formData.set("targetEbitda", targetEbitda);
            formData.set("targetEmployees", targetEmployees);
            formData.set("targetSubIndustry", targetSubIndustry);

            const result = await createDealAction(formData);
            if (result?.success) {
                toast.success("Mandat erfolgreich angelegt!");
                setOpen(false);
                resetForm();
            } else {
                toast.error(result?.error || "Fehler beim Speichern");
            }
        } catch (e) {
            toast.error("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setIsPending(false);
        }
    }

    function resetForm() {
        setName("");
        setType("SELL_SIDE");
        setWebsite("");
        setDescription("");
        setExpectedValue("");
        setProbability("0.1");
        setTargetRevenue("");
        setTargetEbitda("");
        setTargetEmployees("");
        setTargetSubIndustry("");
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Neues Mandat
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900">Neues Mandat anlegen</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 mt-1">
                                Erstellen Sie einen neuen Deal in der Pipeline. Nutzen Sie KI zur schnellen Recherche.
                            </DialogDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleAiResearch}
                            disabled={isAiLoading || !website}
                            className="h-8 text-[11px] bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 font-bold"
                        >
                            {isAiLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                            )}
                            Mit KI recherchieren
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 lg:col-span-1">
                            <Label htmlFor="website" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Website</Label>
                            <Input
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="www.target-firma.de"
                                className="h-9 border-slate-200 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2 col-span-2 lg:col-span-1">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Projekt Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="z.B. Projekt Alpha"
                                className="h-9 border-slate-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Beschreibung</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Kurze Beschreibung des Targets..."
                            className="min-h-[80px] text-sm resize-none border-slate-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deal Typ</Label>
                            <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full h-9 rounded-md border border-slate-200 bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="SELL_SIDE">Sell-Side</option>
                                <option value="BUY_SIDE">Buy-Side</option>
                                <option value="MERGER">Merger</option>
                                <option value="CAPITAL_RAISE">Capital Raise</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expectedValue" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Erw. Wert (€)</Label>
                            <Input
                                id="expectedValue"
                                type="number"
                                value={expectedValue}
                                onChange={(e) => setExpectedValue(e.target.value)}
                                placeholder="5000000"
                                className="h-9 border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="probability" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wahrscheinlichk.</Label>
                            <Input
                                id="probability"
                                type="number"
                                step="0.01"
                                value={probability}
                                onChange={(e) => setProbability(e.target.value)}
                                className="h-9 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target KPIs</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight">Umsatz</Label>
                                <Input type="number" value={targetRevenue} onChange={e => setTargetRevenue(e.target.value)} placeholder="€" className="h-8 text-xs border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight">EBITDA</Label>
                                <Input type="number" value={targetEbitda} onChange={e => setTargetEbitda(e.target.value)} placeholder="€" className="h-8 text-xs border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight">Mitarbeiter</Label>
                                <Input type="number" value={targetEmployees} onChange={e => setTargetEmployees(e.target.value)} placeholder="Zahl" className="h-8 text-xs border-slate-100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-semibold text-slate-500 uppercase tracking-tight">Branche</Label>
                                <Input value={targetSubIndustry} onChange={e => setTargetSubIndustry(e.target.value)} placeholder="..." className="h-8 text-xs border-slate-100" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                        <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:bg-slate-50">Abbrechen</Button>
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 px-8 shadow-blue-200 shadow-lg">
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Speichert...</>
                            ) : (
                                "Speichern & Mandat anlegen"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
