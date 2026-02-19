"use client";

import { EditDealDialog } from "@/components/deals/edit-deal-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteDeal } from "@/app/actions/deals";

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

export function DealActions({ deal }: { deal: DealData }) {
    return (
        <div className="flex items-center gap-2">
            <EditDealDialog deal={deal} />
            <DeleteConfirmDialog
                title="Deal löschen?"
                description={`Sind Sie sicher, dass Sie "${deal.name}" endgültig löschen möchten? Alle zugehörigen Aufgaben, Investoren und Aktivitäten werden ebenfalls gelöscht.`}
                onDelete={() => deleteDeal(deal.id)}
                redirectTo="/deals"
            />
        </div>
    );
}
