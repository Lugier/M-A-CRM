"use client";

import { updateDealStageAction } from "@/app/actions/deal-details";
import { toast } from "sonner";
import { useState } from "react";

export function StageSelector({ dealId, currentStage }: { dealId: string, currentStage: string }) {
    const [isPending, setIsPending] = useState(false);

    async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const stage = e.target.value;
        setIsPending(true);
        try {
            const result = await updateDealStageAction(dealId, stage);
            if (result?.success) {
                toast.success(`Workflow-Status aktualisiert: ${stage}`);
            } else {
                toast.error(result?.error || "Fehler beim Aktualisieren");
            }
        } catch (e) {
            toast.error("Verbindungsfehler");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <select
                name="stage"
                value={currentStage}
                disabled={isPending}
                className="h-9 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:opacity-50 uppercase tracking-widest"
                onChange={handleChange}
            >
                <option value="PITCH">Lead / Pitch</option>
                <option value="MANDATE">Mandat / Execution</option>
                <option value="CLOSING">Closing / Portfolio</option>
            </select>
            {isPending && <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping ml-1" />}
        </div>
    );
}
