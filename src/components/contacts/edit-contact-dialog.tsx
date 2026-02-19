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
import { updateContact } from "@/app/actions/contacts";
import { useState } from "react";
import { toast } from "sonner";

type ContactData = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    organizationId: string | null;
    internalOwnerId?: string | null;
};

type UserOption = {
    id: string;
    name: string;
    initials: string;
};

type OrgOption = {
    id: string;
    name: string;
};

export function EditContactDialog({ contact, organizations, users }: { contact: ContactData; organizations: OrgOption[]; users: UserOption[] }) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const result = await updateContact(contact.id, formData);
            if (result?.success) {
                toast.success("Kontakt aktualisiert!");
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Kontakt bearbeiten</DialogTitle>
                    <DialogDescription>
                        Aktualisieren Sie die Kontaktdaten.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-fn" className="text-right text-sm">Vorname</Label>
                        <Input id="edit-fn" name="firstName" defaultValue={contact.firstName} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-ln" className="text-right text-sm">Nachname</Label>
                        <Input id="edit-ln" name="lastName" defaultValue={contact.lastName} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-email" className="text-right text-sm">E-Mail</Label>
                        <Input id="edit-email" name="email" type="email" defaultValue={contact.email || ""} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-phone" className="text-right text-sm">Telefon</Label>
                        <Input id="edit-phone" name="phone" defaultValue={contact.phone || ""} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-role" className="text-right text-sm">Rolle</Label>
                        <Input id="edit-role" name="role" defaultValue={contact.role || ""} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-org" className="text-right text-sm">Organisation</Label>
                        <select
                            id="edit-org"
                            name="organizationId"
                            defaultValue={contact.organizationId || ""}
                            className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">Keine</option>
                            {organizations.map((org) => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-owner" className="text-right text-sm">Bachert Owner</Label>
                        <select
                            id="edit-owner"
                            name="internalOwnerId"
                            defaultValue={contact.internalOwnerId || "NONE"}
                            className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="NONE">Keiner</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
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
