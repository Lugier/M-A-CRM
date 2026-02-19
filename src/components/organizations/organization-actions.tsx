"use client";

import { EditOrganizationDialog } from "@/components/organizations/edit-organization-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteOrganization } from "@/app/actions/organizations";

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

export function OrganizationActions({ organization }: { organization: OrgData }) {
    return (
        <div className="flex items-center gap-2">
            <EditOrganizationDialog organization={organization} />
            <DeleteConfirmDialog
                title="Organisation löschen?"
                description={`Sind Sie sicher, dass Sie "${organization.name}" endgültig löschen möchten? Alle zugehörigen Kontakte werden entkoppelt.`}
                onDelete={() => deleteOrganization(organization.id)}
                redirectTo="/organizations"
            />
        </div>
    );
}
