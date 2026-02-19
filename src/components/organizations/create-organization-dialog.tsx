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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Globe, MapPin, Sparkles, Loader2 } from "lucide-react";
import { createOrganization } from "@/app/actions/organizations";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";

export function CreateOrganizationDialog() {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [type, setType] = useState("STRATEGIC_INVESTOR");
    const [aiUrl, setAiUrl] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    // AI-Felder als State damit sie durch AI befüllt werden können
    const [name, setName] = useState("");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [ticketSizeMin, setTicketSizeMin] = useState("");
    const [ticketSizeMax, setTicketSizeMax] = useState("");
    const [aum, setAum] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [revenue, setRevenue] = useState("");
    const [employees, setEmployees] = useState("");

    function resetForm() {
        setName(""); setIndustry(""); setWebsite(""); setAddress("");
        setDescription(""); setTicketSizeMin(""); setTicketSizeMax("");
        setAum(""); setCity(""); setCountry(""); setType("BUYER"); setAiUrl("");
        setRevenue(""); setEmployees("");
    }

    async function handleAiResearch() {
        if (!aiUrl.trim()) {
            toast.error("Bitte eine Website-URL eingeben");
            return;
        }
        setIsAiLoading(true);
        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "org-from-website",
                    data: { websiteUrl: aiUrl.trim() }
                })
            });
            const json = await res.json();
            if (!res.ok || !json.orgData) {
                toast.error(json.error || "AI-Recherche fehlgeschlagen");
                return;
            }
            const d = json.orgData;
            // Alle Felder befüllen
            if (d.name) setName(d.name);
            if (d.industry) setIndustry(d.industry);
            if (d.website) setWebsite(d.website);
            if (d.city && d.country) setAddress(`${d.city}, ${d.country}`);
            else if (d.city) setAddress(d.city);
            if (d.description) setDescription(d.description);

            // Financials map
            if (d.ticketSizeMin) setTicketSizeMin(String(d.ticketSizeMin));
            if (d.ticketSizeMax) setTicketSizeMax(String(d.ticketSizeMax));
            if (d.aum) setAum(String(d.aum));
            if (d.revenue) setRevenue(String(d.revenue));
            if (d.employees) setEmployees(String(d.employees));

            if (d.type) {
                const typeMap: Record<string, string> = {
                    "BUYER": "STRATEGIC_INVESTOR",
                    "PE_FUND": "FINANCIAL_INVESTOR",
                    "VC": "FINANCIAL_INVESTOR",
                    "TARGET": "STRATEGIC_INVESTOR",
                    "OTHER": "OTHER"
                };
                setType(typeMap[d.type] || "OTHER");
            }
            toast.success("AI hat alle verfügbaren Firmeninformationen geladen!");
        } catch (e) {
            toast.error("Verbindungsfehler zur AI");
        } finally {
            setIsAiLoading(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData();
        formData.set("name", name);
        formData.set("industry", industry);
        formData.set("type", type);
        formData.set("address", address);
        formData.set("description", description);
        formData.set("website", website);
        formData.set("ticketSizeMin", ticketSizeMin);
        formData.set("ticketSizeMax", ticketSizeMax);
        formData.set("aum", aum);
        formData.set("revenue", revenue);
        formData.set("employees", employees);

        try {
            const result = await createOrganization(formData);
            if (result?.success) {
                toast.success("Organisation erfolgreich angelegt");
                setOpen(false);
                resetForm();
            } else {
                toast.error(result?.error || "Fehler beim Erstellen");
            }
        } catch (e) {
            toast.error("Verbindungsfehler");
        } finally {
            setIsPending(false);
        }
    }

    const isStrategic = type === "STRATEGIC_INVESTOR";
    const isFinancial = type === "FINANCIAL_INVESTOR";

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10">
                    <Plus className="mr-2 h-4 w-4" /> Organisation hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <DialogTitle>Neue Organisation anlegen</DialogTitle>
                    </div>
                    <DialogDescription>
                        Erstellen Sie eine neue Firma – oder lassen Sie die Daten per AI automatisch recherchieren.
                    </DialogDescription>
                </DialogHeader>

                {/* AI Research Section */}
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-4 border border-violet-200/50">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-violet-900">AI-Recherche</span>
                        <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">GPT-5 + Web Search</span>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={aiUrl}
                            onChange={(e) => setAiUrl(e.target.value)}
                            placeholder="Website-URL eingeben, z.B. www.firma.de"
                            className="bg-white border-violet-200 focus:border-violet-400 flex-1"
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAiResearch(); } }}
                        />
                        <Button
                            type="button"
                            onClick={handleAiResearch}
                            disabled={isAiLoading}
                            className="bg-violet-600 hover:bg-violet-700 text-white min-w-[140px] shadow-lg shadow-violet-600/20"
                        >
                            {isAiLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recherchiert...</>
                            ) : (
                                <><Sparkles className="mr-2 h-4 w-4" /> AI Recherche</>
                            )}
                        </Button>
                    </div>
                    <p className="text-[10px] text-violet-500 mt-2">
                        Die AI analysiert die Website und füllt alle Felder automatisch aus.
                    </p>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Name *</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Beispiel GmbH" required className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Branche</Label>
                            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Automotive" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Organisationstyp</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="website" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                <Globe className="w-3 h-3" /> Website
                            </Label>
                            <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.beispiel.de" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Adresse / Standort
                            </Label>
                            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Stadt, Land" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                    </div>

                    {/* Conditional Fields: Strategic (Revenue/Employees) vs Financial (AuM/Tickets) */}
                    {isStrategic && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Umsatz (€)</Label>
                                <Input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="10000000" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mitarbeiter</Label>
                                <Input type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="50" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                            </div>
                        </div>
                    )}

                    {isFinancial && (
                        <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ticket Min (€)</Label>
                                <Input type="number" value={ticketSizeMin} onChange={(e) => setTicketSizeMin(e.target.value)} placeholder="5M" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ticket Max (€)</Label>
                                <Input type="number" value={ticketSizeMax} onChange={(e) => setTicketSizeMax(e.target.value)} placeholder="50M" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AuM (€)</Label>
                                <Input type="number" value={aum} onChange={(e) => setAum(e.target.value)} placeholder="500M" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Kurzbeschreibung</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Wichtige Infos zum Unternehmen..." className="bg-slate-50 border-slate-200 focus:bg-white transition-all min-h-[80px]" />
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                            {isPending ? "Lädt..." : "Speichern"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
