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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteConfirmDialog({
    title,
    description,
    onDelete,
    redirectTo,
}: {
    title: string;
    description: string;
    onDelete: () => Promise<{ success?: boolean; error?: string }>;
    redirectTo?: string;
}) {
    const [open, setOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setIsPending(true);
        try {
            const result = await onDelete();
            if (result?.success) {
                toast.success("Erfolgreich gelöscht");
                setOpen(false);
                if (redirectTo) {
                    router.push(redirectTo);
                }
            } else {
                toast.error(result?.error || "Fehler beim Löschen");
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
                <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Löschen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-rose-600">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                        {isPending ? "Löscht..." : "Endgültig löschen"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
