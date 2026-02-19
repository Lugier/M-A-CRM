import { getContacts } from "@/app/actions/contacts";
import { getOrganizations } from "@/app/actions/organizations";
import { getUsers } from "@/app/actions/users";
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog";
import { User, Mail, Building2 } from "lucide-react";
import Link from "next/link";

export default async function ContactsPage() {
    const contacts = await getContacts();
    const organizations = await getOrganizations();
    const users = await getUsers();

    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            <div className="flex items-center justify-between flex-none mb-6">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kontakte</h1>
                    <p className="text-slate-500 text-sm">Verwalten Sie Ihre M&A Ansprechpartner und Kontaktpersonen.</p>
                </div>
                <CreateContactDialog organizations={organizations} contacts={contacts} users={users} />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {contacts.map((contact: any) => (
                        <Link key={contact.id} href={`/contacts/${contact.id}`}>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group cursor-pointer h-full flex flex-col justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
                                        {contact.lastName.substring(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                            {contact.firstName} {contact.lastName}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium truncate">{contact.role || "Professional"}</p>
                                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-blue-600 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded w-fit">
                                            <Building2 className="w-3 h-3" />
                                            <span className="truncate">{contact.organization?.name || "Unabhängig"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-[10px] text-slate-400 font-medium">
                                    <Mail className="w-3 h-3 mr-1.5 text-slate-300" />
                                    <span className="truncate">{contact.email || "Keine E-Mail"}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {contacts.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                            <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-bold">Keine Kontakte vorhanden.</p>
                            <p className="text-slate-300 text-xs mt-1">Erstellen Sie Ihren ersten Kontakt.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
