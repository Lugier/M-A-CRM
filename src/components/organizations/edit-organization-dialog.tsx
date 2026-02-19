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
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Building2 } from "lucide-react";
import { updateOrganization } from "@/app/actions/organizations";
import { useState } from "react";
import { toast } from "sonner";

import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";

const ORG_TYPES = Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

type OrgData = {
    id: string;
    name: string;
    industry: string | null;
    type: string;
    address?: string | null;
    description?: string | null;
    website?: string | null;
    ticketSizeMin: number | null;
    ticketSizeMax: number | null;
    aum: number | null;
};

export function EditOrganizationDialog({ organization }: { organization: OrgData }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        try {
            const result = await updateOrganization(organization.id, formData);
            if (result?.success) {
                toast.success("Organisation aktualisiert!");
                setOpen(false);
            } else {
                toast.error(result?.error || "Fehler beim Speichern");
            }
        } catch {
            toast.error("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-slate-600 hover:text-blue-600 hover:border-blue-200">
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Bearbeiten
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-blue-600" />
                            </div>
                            <DialogTitle>Organisation bearbeiten</DialogTitle>
                        </div>
                        <DialogDescription>
                            Aktualisieren Sie die Stammdaten von {organization.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Name</Label>
                                <Input id="edit-name" name="name" defaultValue={organization.name} className="bg-slate-50 focus:bg-white" required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-industry" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Branche</Label>
                                <Input id="edit-industry" name="industry" defaultValue={organization.industry || ""} className="bg-slate-50 focus:bg-white" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-type" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Typ</Label>
                            <select
                                id="edit-type"
                                name="type"
                                defaultValue={organization.type}
                                className="w-full h-10 rounded-md border border-input bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                {ORG_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-website" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Website</Label>
                                <Input id="edit-website" name="website" defaultValue={organization.website || ""} placeholder="www.beispiel.de" className="bg-slate-50 focus:bg-white" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-address" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Adresse</Label>
                                <Input id="edit-address" name="address" defaultValue={organization.address || ""} placeholder="Straße, Ort" className="bg-slate-50 focus:bg-white" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-description" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Beschreibung</Label>
                            <Textarea id="edit-description" name="description" defaultValue={organization.description || ""} placeholder="Details zum Unternehmen..." className="bg-slate-50 focus:bg-white min-h-[80px]" />
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2 border-t mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-tsmin" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center block">Min (€)</Label>
                                <Input id="edit-tsmin" name="ticketSizeMin" type="number" defaultValue={organization.ticketSizeMin || ""} className="h-8 text-xs text-center" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-tsmax" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center block">Max (€)</Label>
                                <Input id="edit-tsmax" name="ticketSizeMax" type="number" defaultValue={organization.ticketSizeMax || ""} className="h-8 text-xs text-center" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-aum" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center block">AUM (€)</Label>
                                <Input id="edit-aum" name="aum" type="number" defaultValue={organization.aum || ""} className="h-8 text-xs text-center" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Abbrechen</Button>
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                            {isPending ? "Speichert..." : "Speichern"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
