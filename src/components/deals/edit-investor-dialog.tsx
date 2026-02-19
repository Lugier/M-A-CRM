"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { updateDealInvestorAction, getOrganizationDetailsAction } from "@/app/actions/deal-details";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

type Contact = {
    id: string;
    firstName: string;
    lastName: string;
    role: string | null;
};

type EditInvestorDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    dealId: string;
    investor: any; // Using any for simplicity with the row data
};

const STATUS_OPTIONS = [
    { value: "LONGLIST", label: "Longlist" },
    { value: "SHORTLIST", label: "Shortlist" },
    { value: "CONTACTED", label: "Angesprochen" },
    { value: "NDA_SENT", label: "NDA Versendet" },
    { value: "NDA_SIGNED", label: "NDA Unterschrieben" },
    { value: "IM_SENT", label: "IM Versendet" },
    { value: "BID_RECEIVED", label: "Angebot Erhalten" },
    { value: "DROPPED", label: "Abgesagt / Pass" },
];


export function EditInvestorDialog({ isOpen, onClose, dealId, investor }: EditInvestorDialogProps) {
    const [status, setStatus] = useState(investor?.status || "LONGLIST");
    const [notes, setNotes] = useState(investor?.notes || "");
    const [priority, setPriority] = useState(investor?.priority || 0); // 0-3
    const [selectedContactId, setSelectedContactId] = useState<string | null>(investor?.contactId || null);
    const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingContacts, setIsFetchingContacts] = useState(false);

    useEffect(() => {
        if (isOpen && investor) {
            setStatus(investor.status || "LONGLIST");
            setNotes(investor.notes || "");
            setPriority(investor.priority || 0);
            setSelectedContactId(investor.contactId || null);

            // Fetch contacts for this organization
            const fetchOrgContacts = async () => {
                setIsFetchingContacts(true);
                try {
                    const details = await getOrganizationDetailsAction(investor.organizationId);
                    if (details && details.contacts) {
                        setAvailableContacts(details.contacts as any);
                    }
                } catch (error) {
                    console.error("Error fetching organization contacts:", error);
                } finally {
                    setIsFetchingContacts(false);
                }
            };
            fetchOrgContacts();
        }
    }, [isOpen, investor]);

    async function handleSave() {
        if (!investor) return;
        setIsLoading(true);

        const result = await updateDealInvestorAction(dealId, investor.organizationId, {
            status,
            notes,
            priority: Number(priority),
            contactId: selectedContactId, // Allow updating contact
        });

        setIsLoading(false);

        if (result?.success) {
            toast.success("Investor aktualisiert");
            onClose();
        } else {
            toast.error(result?.error || "Fehler beim Speichern");
        }
    }

    if (!investor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Investor bearbeiten</DialogTitle>
                    <DialogDescription>
                        Details für <span className="font-bold text-slate-700">{investor.organization?.name}</span> anpassen.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Priorität (0-3)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={3}
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Ansprechpartner
                        </Label>
                        <Select
                            value={selectedContactId || "NONE"}
                            onValueChange={(val) => setSelectedContactId(val === "NONE" ? null : val)}
                            disabled={isFetchingContacts}
                        >
                            <SelectTrigger className="bg-slate-50/50">
                                <SelectValue placeholder={isFetchingContacts ? "Lade Kontakte..." : "Kontakt wählen..."} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Kein direkter Kontakt</SelectItem>
                                {availableContacts.map(c => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.firstName} {c.lastName} {c.role ? `(${c.role})` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notizen / Feedback</Label>
                        <Textarea
                            placeholder="Interne Notizen oder Feedback..."
                            className="min-h-[100px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
