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
import { Pencil } from "lucide-react";
import { updateDeal } from "@/app/actions/deals";
import { useState } from "react";
import { toast } from "sonner";

const DEAL_TYPES = [
    { value: "SELL_SIDE", label: "Sell-Side" },
    { value: "BUY_SIDE", label: "Buy-Side" },
    { value: "MERGER", label: "Merger" },
    { value: "CAPITAL_RAISE", label: "Capital Raise" },
];

const DEAL_STATUSES = [
    { value: "ACTIVE", label: "Aktiv" },
    { value: "ON_HOLD", label: "Pausiert" },
    { value: "CLOSED_WON", label: "Closed Won" },
    { value: "CLOSED_LOST", label: "Closed Lost" },
    { value: "LEAD", label: "Lead" },
];

type DealData = {
    id: string;
    name: string;
    type: string;
    status: string;
    expectedValue: number | null;
    probability: number | null;
    feeRetainer: number | null;
    feeSuccess: number | null;
};

export function EditDealDialog({ deal }: { deal: DealData }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const result = await updateDeal(deal.id, formData);
            if (result?.success) {
                toast.success("Deal aktualisiert!");
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
                <Button variant="outline" size="sm" className="text-slate-600">
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Bearbeiten
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Deal bearbeiten</DialogTitle>
                    <DialogDescription>
                        Aktualisieren Sie die Details dieses Mandats.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right text-sm">Name</Label>
                        <Input id="edit-name" name="name" defaultValue={deal.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-type" className="text-right text-sm">Typ</Label>
                        <select
                            id="edit-type"
                            name="type"
                            defaultValue={deal.type}
                            className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {DEAL_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-status" className="text-right text-sm">Status</Label>
                        <select
                            id="edit-status"
                            name="status"
                            defaultValue={deal.status}
                            className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {DEAL_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-value" className="text-right text-sm">Wert (€)</Label>
                        <Input id="edit-value" name="expectedValue" type="number" defaultValue={deal.expectedValue || ""} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-prob" className="text-right text-sm">Wahrscheinl.</Label>
                        <Input id="edit-prob" name="probability" type="number" step="0.01" min="0" max="1" defaultValue={deal.probability || ""} placeholder="0.0 - 1.0" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-retainer" className="text-right text-sm">Retainer (€)</Label>
                        <Input id="edit-retainer" name="feeRetainer" type="number" defaultValue={deal.feeRetainer || ""} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-success" className="text-right text-sm">Success Fee (€)</Label>
                        <Input id="edit-success" name="feeSuccess" type="number" defaultValue={deal.feeSuccess || ""} className="col-span-3" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
                        <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                            {isPending ? "Speichert..." : "Speichern"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
