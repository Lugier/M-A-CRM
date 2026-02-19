"use client";

import { EditContactDialog } from "@/components/contacts/edit-contact-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteContact } from "@/app/actions/contacts";

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

type OrgOption = {
    id: string;
    name: string;
};

type UserOption = {
    id: string;
    name: string;
    initials: string;
};

export function ContactActions({ contact, organizations, users }: { contact: ContactData; organizations: OrgOption[]; users: UserOption[] }) {
    return (
        <div className="flex items-center gap-2">
            <EditContactDialog contact={contact} organizations={organizations} users={users} />
            <DeleteConfirmDialog
                title="Kontakt löschen?"
                description={`Sind Sie sicher, dass Sie "${contact.firstName} ${contact.lastName}" endgültig löschen möchten?`}
                onDelete={() => deleteContact(contact.id)}
                redirectTo="/contacts"
            />
        </div>
    );
}
