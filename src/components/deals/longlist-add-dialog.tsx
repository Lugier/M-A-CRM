"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Check, ChevronsUpDown, UserPlus, Loader2, Building2, ArrowLeft, ArrowRight, Sparkles, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { createUnifiedInvestorAction, getOrganizationDetailsAction } from "@/app/actions/deal-details";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Organization {
    id: string;
    name: string;
    industry: string | null;
}

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    role: string | null;
}

type Step = "SELECT_ORG" | "ORG_DETAILS" | "SELECT_CONTACT" | "CONTACT_DETAILS";

export function LonglistAddDialog({
    dealId,
    organizations,
    existingInvestorIds = []
}: {
    dealId: string,
    organizations: Organization[],
    existingInvestorIds?: string[]
}) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("SELECT_ORG");

    // Organization state
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [orgPopoverOpen, setOrgPopoverOpen] = useState(false);
    const [newOrganization, setNewOrganization] = useState({
        name: "",
        industry: "",
        description: "",
        address: "",
        type: "BUYER",
        website: "",
        ticketSizeMin: "",
        ticketSizeMax: "",
        aum: "",
        revenue: "",
        employees: ""
    });

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiUrl, setAiUrl] = useState("");

    const handleAiResearch = async () => {
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
            setNewOrganization(prev => ({
                ...prev,
                name: d.name || prev.name,
                industry: d.industry || prev.industry,
                website: d.website || prev.website,
                address: (d.city && d.country) ? `${d.city}, ${d.country}` : (d.city || prev.address),
                description: d.description || prev.description,
                ticketSizeMin: d.ticketSizeMin ? String(d.ticketSizeMin) : prev.ticketSizeMin,
                ticketSizeMax: d.ticketSizeMax ? String(d.ticketSizeMax) : prev.ticketSizeMax,
                aum: d.aum ? String(d.aum) : prev.aum,
                revenue: d.revenue ? String(d.revenue) : prev.revenue,
                employees: d.employees ? String(d.employees) : prev.employees,
                type: d.type || prev.type
            }));
            toast.success("AI hat alle verfügbaren Firmeninformationen geladen!");
        } catch (e) {
            toast.error("Verbindungsfehler zur AI");
        } finally {
            setIsAiLoading(false);
        }
    };

    // Contact state
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string | "NEW" | null>(null);
    const [newContact, setNewContact] = useState({
        title: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: ""
    });

    const selectedOrg = organizations.find(o => o.id === selectedOrgId);

    const handleOrgSelect = async (orgId: string) => {
        try {
            setSelectedOrgId(orgId);
            setOrgPopoverOpen(false);
            setIsLoadingContacts(true);
            setStep("SELECT_CONTACT");

            const details = await getOrganizationDetailsAction(orgId);
            if (details && details.contacts.length > 0) {
                setAvailableContacts(details.contacts as any);
                // Default to the first contact
                setSelectedContactId(details.contacts[0].id);
            }
        } catch (error) {
            console.error("Error selecting organization:", error);
            toast.error("Ansprechpartner konnten nicht geladen werden");
        } finally {
            setIsLoadingContacts(false);
        }
    };

    const handleNext = () => {
        if (step === "SELECT_ORG") {
            if (selectedOrgId) setStep("SELECT_CONTACT");
            else setStep("ORG_DETAILS");
        } else if (step === "ORG_DETAILS") {
            setStep("CONTACT_DETAILS");
        } else if (step === "SELECT_CONTACT") {
            if (selectedContactId === "NEW") setStep("CONTACT_DETAILS");
            else handleSubmit();
        } else if (step === "CONTACT_DETAILS") {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step === "ORG_DETAILS") setStep("SELECT_ORG");
        else if (step === "SELECT_CONTACT") setStep("SELECT_ORG");
        else if (step === "CONTACT_DETAILS") {
            if (selectedOrgId) setStep("SELECT_CONTACT");
            else setStep("ORG_DETAILS");
        }
    };

    const handleSubmit = async () => {
        try {
            const loadingToast = toast.loading("Investor wird hinzugefügt...");

            const result = await createUnifiedInvestorAction(dealId, {
                org: selectedOrgId ? { id: selectedOrgId, name: selectedOrg?.name || "" } : {
                    ...newOrganization,
                    ticketSizeMin: newOrganization.ticketSizeMin ? parseFloat(newOrganization.ticketSizeMin) : undefined,
                    ticketSizeMax: newOrganization.ticketSizeMax ? parseFloat(newOrganization.ticketSizeMax) : undefined,
                    aum: newOrganization.aum ? parseFloat(newOrganization.aum) : undefined,
                    revenue: newOrganization.revenue ? parseFloat(newOrganization.revenue) : undefined,
                    employees: newOrganization.employees ? parseInt(newOrganization.employees) : undefined,
                },
                contact: selectedContactId === "NEW" || !selectedOrgId ? newContact : (selectedContactId ? { id: selectedContactId, firstName: "", lastName: "" } : undefined)
            });

            toast.dismiss(loadingToast);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Investor erfolgreich zur Longlist hinzugefügt");
                setOpen(false);
                resetState();
            }
        } catch (e) {
            toast.error("Ein unerwarteter Fehler ist aufgetreten");
        }
    };

    const resetState = () => {
        setSelectedOrgId(null);
        setStep("SELECT_ORG");
        setOrgPopoverOpen(false);
        setNewOrganization({
            name: "",
            industry: "",
            description: "",
            address: "",
            type: "BUYER",
            website: "",
            ticketSizeMin: "",
            ticketSizeMax: "",
            aum: "",
            revenue: "",
            employees: ""
        });
        setAiUrl("");
        setSelectedContactId(null);
        setAvailableContacts([]);
        setNewContact({ title: "", firstName: "", lastName: "", email: "", phone: "", role: "" });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Investor hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] overflow-visible">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <DialogTitle>Investor hinzufügen</DialogTitle>
                    </div>
                    <DialogDescription>
                        {step === "SELECT_ORG" && "Wählen Sie ein Unternehmen aus Ihrer Datenbank oder erstellen Sie ein neues."}
                        {step === "ORG_DETAILS" && "Geben Sie die Firmendetails für das neue Unternehmen ein."}
                        {step === "SELECT_CONTACT" && `Wählen Sie einen Ansprechpartner bei ${selectedOrg?.name}.`}
                        {step === "CONTACT_DETAILS" && "Geben Sie die Kontaktdaten für den Ansprechpartner ein."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 min-h-[300px]">
                    {step === "SELECT_ORG" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Organisation suchen</Label>
                                <Popover open={orgPopoverOpen} onOpenChange={setOrgPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between h-12 bg-slate-50 border-slate-200 hover:bg-white transition-all">
                                            <span className="truncate">{selectedOrg ? selectedOrg.name : "Firma suchen..."}</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[450px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Organisation suchen..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-4 text-center">
                                                        <p className="text-sm text-slate-500 mb-3">Keine Firma gefunden.</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => {
                                                                setOrgPopoverOpen(false);
                                                                setStep("ORG_DETAILS");
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4 mr-2" /> Neue Firma erstellen
                                                        </Button>
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {organizations.map((org) => {
                                                        const isExisting = existingInvestorIds.includes(org.id);
                                                        return (
                                                            <CommandItem
                                                                key={org.id}
                                                                value={`${org.name} ${org.id}`}
                                                                onSelect={() => {
                                                                    if (!isExisting) {
                                                                        handleOrgSelect(org.id);
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "flex items-center px-4 py-3 cursor-pointer transition-colors group",
                                                                    isExisting ? "opacity-30 cursor-not-allowed bg-slate-50/10" : "hover:bg-blue-50/50"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0",
                                                                    isExisting ? "bg-slate-100" : "bg-blue-50"
                                                                )}>
                                                                    <Building2 className={cn("w-4 h-4", isExisting ? "text-slate-400" : "text-blue-600")} />
                                                                </div>
                                                                <div className="flex flex-col flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={cn("font-bold truncate", isExisting ? "text-slate-500" : "text-slate-900")}>
                                                                            {org.name}
                                                                        </span>
                                                                        {isExisting && (
                                                                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-100 text-slate-500 border-slate-200 uppercase tracking-tighter">
                                                                                Bereits dabei
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {org.industry && (
                                                                        <span className="text-[11px] text-slate-500 truncate font-medium">
                                                                            {org.industry}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {selectedOrgId === org.id && (
                                                                    <div className="ml-2 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                                                        <Check className="h-3 w-3 text-blue-600 stroke-[3]" />
                                                                    </div>
                                                                )}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Separator />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                    <span className="bg-white px-2 text-slate-400">Oder</span>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all"
                                onClick={() => setStep("ORG_DETAILS")}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Neue Organisation anlegen
                            </Button>
                        </div>
                    )}

                    {step === "ORG_DETAILS" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* AI Research Section */}
                            <div className="bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-4 border border-violet-200/50 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                                        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-violet-900">AI-Recherche</span>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        value={aiUrl}
                                        onChange={(e) => setAiUrl(e.target.value)}
                                        placeholder="Website-URL eingeben..."
                                        className="bg-white border-violet-200 focus:border-violet-400 flex-1 h-9"
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAiResearch(); } }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAiResearch}
                                        disabled={isAiLoading}
                                        size="sm"
                                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
                                    >
                                        {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                        {isAiLoading ? "" : "Go"}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Firmenname *</Label>
                                    <Input
                                        placeholder="z.B. Schmidt & Co. KG"
                                        value={newOrganization.name}
                                        onChange={e => setNewOrganization({ ...newOrganization, name: e.target.value })}
                                        className="h-10 bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Branche</Label>
                                    <Input
                                        placeholder="z.B. Automobil"
                                        value={newOrganization.industry}
                                        onChange={e => setNewOrganization({ ...newOrganization, industry: e.target.value })}
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Typ</Label>
                                    <Select
                                        value={newOrganization.type}
                                        onValueChange={(v: string) => setNewOrganization({ ...newOrganization, type: v })}
                                    >
                                        <SelectTrigger className="h-10 bg-slate-50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUYER">Stratege (Buyer)</SelectItem>
                                            <SelectItem value="TARGET">Unternehmen (Target)</SelectItem>
                                            <SelectItem value="PE_FUND">Private Equity (FI)</SelectItem>
                                            <SelectItem value="VC">Venture Capital</SelectItem>
                                            <SelectItem value="OTHER">Family Office / Andere</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                        <Globe className="w-3 h-3" /> Website
                                    </Label>
                                    <Input
                                        placeholder="www.beispiel.de"
                                        value={newOrganization.website}
                                        onChange={e => setNewOrganization({ ...newOrganization, website: e.target.value })}
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3" /> Adresse
                                    </Label>
                                    <Input
                                        placeholder="Stadt, Land"
                                        value={newOrganization.address}
                                        onChange={e => setNewOrganization({ ...newOrganization, address: e.target.value })}
                                        className="bg-slate-50"
                                    />
                                </div>

                                {(newOrganization.type === "BUYER" || newOrganization.type === "TARGET") ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Umsatz (€)</Label>
                                            <Input
                                                type="number"
                                                placeholder="z.B. 10000000"
                                                value={newOrganization.revenue}
                                                onChange={e => setNewOrganization({ ...newOrganization, revenue: e.target.value })}
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mitarbeiter</Label>
                                            <Input
                                                type="number"
                                                placeholder="50"
                                                value={newOrganization.employees}
                                                onChange={e => setNewOrganization({ ...newOrganization, employees: e.target.value })}
                                                className="bg-slate-50"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ticket Min (€/M)</Label>
                                            <Input
                                                type="number"
                                                placeholder="5"
                                                value={newOrganization.ticketSizeMin}
                                                onChange={e => setNewOrganization({ ...newOrganization, ticketSizeMin: e.target.value })}
                                                className="bg-slate-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ticket Max (€/M)</Label>
                                            <Input
                                                type="number"
                                                placeholder="50"
                                                value={newOrganization.ticketSizeMax}
                                                onChange={e => setNewOrganization({ ...newOrganization, ticketSizeMax: e.target.value })}
                                                className="bg-slate-50"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Unternehmensbeschreibung</Label>
                                    <Textarea
                                        placeholder="Kurze Beschreibung des Investors..."
                                        value={newOrganization.description}
                                        onChange={e => setNewOrganization({ ...newOrganization, description: e.target.value })}
                                        className="min-h-[80px] bg-slate-50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "SELECT_CONTACT" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-blue-600 border border-blue-100">
                                    {selectedOrg?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">{selectedOrg?.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{selectedOrg?.industry || "Keine Branche"}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ansprechpartner wählen</Label>
                                {isLoadingContacts ? (
                                    <div className="h-12 flex items-center justify-center border rounded-xl border-dashed text-slate-400">
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        <span>Lade Kontakte...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Select
                                            value={selectedContactId === null ? "NONE" : selectedContactId}
                                            onValueChange={(val: string) => setSelectedContactId(val === "NONE" ? null : val)}
                                        >
                                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all shadow-sm">
                                                <SelectValue placeholder="Kontakt auswählen..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NONE">Kein Kontakt zuweisen</SelectItem>
                                                {availableContacts.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.firstName} {c.lastName} {c.role ? `(${c.role})` : ""}
                                                    </SelectItem>
                                                ))}
                                                {availableContacts.length > 0 && <Separator className="my-1" />}
                                                <SelectItem value="NEW" className="text-blue-600 font-bold focus:text-blue-700">
                                                    <div className="flex items-center gap-2">
                                                        <UserPlus className="w-4 h-4" /> Neuen Kontakt erstellen
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {selectedContactId === "NEW" && (
                                            <div className="space-y-4 pt-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                    <UserPlus className="w-3 h-3" /> Neue Kontaktdaten
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vorname</Label>
                                                        <Input placeholder="Max" value={newContact.firstName} onChange={e => setNewContact({ ...newContact, firstName: e.target.value })} className="h-9 bg-white border-slate-200" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nachname *</Label>
                                                        <Input placeholder="Mustermann" value={newContact.lastName} onChange={e => setNewContact({ ...newContact, lastName: e.target.value })} className="h-9 bg-white border-slate-200" required />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">E-Mail</Label>
                                                        <Input placeholder="max@beispiel.de" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} className="h-9 bg-white border-slate-200" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Position</Label>
                                                        <Input placeholder="Partner" value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })} className="h-9 bg-white border-slate-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === "CONTACT_DETAILS" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {!selectedOrgId && (
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 mb-2">
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                        <Check className="w-3 h-3" /> Neue Firma: {newOrganization.name}
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-inner">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vorname</Label>
                                    <Input placeholder="Max" value={newContact.firstName} onChange={e => setNewContact({ ...newContact, firstName: e.target.value })} className="h-9 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nachname *</Label>
                                    <Input placeholder="Mustermann" value={newContact.lastName} onChange={e => setNewContact({ ...newContact, lastName: e.target.value })} className="h-9 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">E-Mail</Label>
                                    <Input placeholder="max@beispiel.de" value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} className="h-9 bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Position</Label>
                                    <Input placeholder="Partner" value={newContact.role} onChange={e => setNewContact({ ...newContact, role: e.target.value })} className="h-9 bg-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4 bg-slate-50/20 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                    <div className="flex w-full justify-between items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            disabled={step === "SELECT_ORG"}
                            className="text-slate-500"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Abbrechen</Button>
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                onClick={handleNext}
                                disabled={
                                    (step === "SELECT_ORG" && !selectedOrgId) ||
                                    (step === "ORG_DETAILS" && !newOrganization.name) ||
                                    (step === "CONTACT_DETAILS" && !newContact.lastName)
                                }
                            >
                                {step === "CONTACT_DETAILS" || (step === "SELECT_CONTACT" && selectedContactId !== "NEW") ? "Fertigstellen" : "Weiter"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
