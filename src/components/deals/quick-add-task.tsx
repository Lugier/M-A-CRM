"use client";

import { addTaskAction } from "@/app/actions/deal-details";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function QuickAddTask({ dealId }: { dealId: string }) {
    const [isPending, setIsPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        const title = formData.get("title") as string;
        if (!title) return;

        setIsPending(true);
        try {
            const result = await addTaskAction(dealId, title);
            if (result?.success) {
                toast.success("Aufgabe erstellt");
                formRef.current?.reset();
            } else {
                toast.error(result?.error || "Fehler beim Erstellen");
            }
        } catch (e) {
            toast.error("Verbindungsfehler");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} className="flex gap-2">
            <Input name="title" placeholder="Was ist zu tun?" className="flex-1" disabled={isPending} />
            <Button type="submit" size="sm" disabled={isPending}>
                <Plus className="w-4 h-4 mr-1" /> {isPending ? "Lädt..." : "Hinzufügen"}
            </Button>
        </form>
    );
}
