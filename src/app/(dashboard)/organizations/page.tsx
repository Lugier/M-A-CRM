import { getOrganizations } from "@/app/actions/organizations";
import { CreateOrganizationDialog } from "@/components/organizations/create-organization-dialog";
import { Building2, Users } from "lucide-react";
import Link from "next/link";

export default async function OrganizationsPage() {
    const organizations = await getOrganizations();

    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            <div className="flex items-center justify-between flex-none mb-6">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organisationen</h1>
                    <p className="text-slate-500 text-sm">Ihre Unternehmensdatenbank für M&A Transaktionen.</p>
                </div>
                <CreateOrganizationDialog />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {organizations.map((org: any) => (
                        <Link key={org.id} href={`/organizations/${org.id}`}>
                            <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group cursor-pointer h-full flex flex-col justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
                                        {org.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                            {org.name}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium truncate">{org.industry || "Branche unbekannt"}</p>
                                    </div>
                                    <Building2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                                        <Users className="w-3 h-3" />
                                        <span>{org._count.contacts} Kontakte</span>
                                    </div>
                                    <span className="font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded">
                                        {org.type === "BUYER" ? "Käufer" : org.type === "VC" ? "VC" : org.type === "PE_FUND" ? "PE Fund" : "Firma"}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {organizations.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                            <Building2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm font-bold">Keine Organisationen vorhanden.</p>
                            <p className="text-slate-300 text-xs mt-1">Erstellen Sie Ihre erste Organisation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
