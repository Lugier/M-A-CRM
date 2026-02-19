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
import { Plus, User, Building2, UserPlus, Briefcase } from "lucide-react";
import { createContact } from "@/app/actions/contacts";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CreateContactDialog({ organizations, contacts, users, defaultOrganizationId }: { organizations: any[], contacts?: any[], users?: any[], defaultOrganizationId?: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [orgSelection, setOrgSelection] = useState<string>(defaultOrganizationId || "");
    const [newOrgType, setNewOrgType] = useState("BUYER");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        formData.append("organizationId", orgSelection);
        if (orgSelection === "NEW") {
            formData.append("newOrgType", newOrgType);
        }

        try {
            const result = await createContact(formData);
            if (result?.success) {
                toast.success("Kontakt erfolgreich angelegt");
                setOpen(false);
                resetState();
            } else {
                toast.error(result?.error || "Fehler beim Erstellen");
            }
        } catch (e) {
            toast.error("Verbindungsfehler");
        } finally {
            setIsPending(false);
        }
    }

    const resetState = () => {
        setOrgSelection(defaultOrganizationId || "");
        setNewOrgType("BUYER");
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/10">
                    <UserPlus className="mr-2 h-4 w-4" /> Kontakt hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <DialogTitle>Neuen Kontakt anlegen</DialogTitle>
                    </div>
                    <DialogDescription>
                        Fügen Sie eine Person hinzu und verknüpfen Sie sie mit einer Organisation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vorname</Label>
                            <Input id="firstName" name="firstName" placeholder="Max" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nachname *</Label>
                            <Input id="lastName" name="lastName" placeholder="Mustermann" required className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                    </div>



                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">E-Mail</Label>
                            <Input id="email" name="email" type="email" placeholder="max@beispiel.de" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                <Briefcase className="w-3 h-3" /> Position / Rolle
                            </Label>
                            <Input id="role" name="role" placeholder="z.B. Managing Director" className="bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                        </div>
                    </div>

                    {/* Referral Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="introducedById" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Empfohlen durch (Referral)</Label>
                        <Select name="introducedById" defaultValue="NONE">
                            <SelectTrigger className="bg-slate-50 border-slate-200 h-9">
                                <SelectValue placeholder="Wählen Sie einen Kontakt..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Keine Empfehlung</SelectItem>
                                {contacts?.map((contact: any) => (
                                    <SelectItem key={contact.id} value={contact.id}>
                                        {contact.firstName} {contact.lastName} ({contact.organization?.name || "Unabhängig"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="internalOwnerId" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bachert-Zuständigkeit (Owner)</Label>
                        <Select name="internalOwnerId" defaultValue="NONE">
                            <SelectTrigger className="bg-slate-50 border-slate-200 h-9">
                                <SelectValue placeholder="Bachert Employee wählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Keine Zuständigkeit</SelectItem>
                                {users?.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.initials})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-slate-400" /> Organisation
                        </Label>
                        <Select value={orgSelection || "NONE"} onValueChange={(val: string) => setOrgSelection(val === "NONE" ? "" : val)}>
                            <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                                <SelectValue placeholder="Firma auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Keine Auswahl</SelectItem>
                                {organizations.map(org => (
                                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                ))}
                                <div className="my-1 border-t" />
                                <SelectItem value="NEW" className="text-blue-600 font-bold">
                                    <span className="flex items-center gap-2">
                                        <Plus className="w-3 h-3" /> Neue Organisation erstellen
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {orgSelection === "NEW" && (
                            <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300 mt-2">
                                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Stammdaten neue Firma</p>
                                <div className="space-y-2">
                                    <Label htmlFor="newOrgName" className="text-[10px] font-bold text-slate-500">Firmenname *</Label>
                                    <Input id="newOrgName" name="newOrgName" placeholder="Zukünftige Partner AG" required className="h-9 bg-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-slate-500">Typ</Label>
                                        <Select value={newOrgType} onValueChange={setNewOrgType}>
                                            <SelectTrigger className="h-9 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BUYER">Stratege</SelectItem>
                                                <SelectItem value="PE_FUND">FI</SelectItem>
                                                <SelectItem value="OTHER">Family Office</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newOrgIndustry" className="text-[10px] font-bold text-slate-500">Branche</Label>
                                        <Input id="newOrgIndustry" name="newOrgIndustry" placeholder="z.B. Tech" className="h-9 bg-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t mt-4">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Abbrechen</Button>
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                            {isPending ? "Lädt..." : "Speichern"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
