import { getOrganizationById } from "@/app/actions/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Users, Briefcase, Mail, Globe, MapPin, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { OrganizationActions } from "@/components/organizations/organization-actions";
import { OrganizationQuickAdd } from "@/components/organizations/organization-quick-add";
import { getDeals } from "@/app/actions/deals";
import { ContactCard } from "@/components/organizations/contact-card";
import { OrganizationFeed } from "@/components/organizations/organization-feed";

import { ORGANIZATION_TYPE_LABELS, DEAL_STATUS_LABELS, DEAL_TYPE_LABELS } from "@/lib/constants";

export default async function OrganizationDetailPage({ params }: { params: { orgId: string } }) {
    const org = await getOrganizationById(params.orgId);

    if (!org) {
        notFound();
    }

    const allDeals = await getDeals();

    return (
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="flex flex-col gap-8 p-4 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Navigation */}
                <BackButton label="Zurück zur Übersicht" variant="premium" />

                {/* Main Header Card */}
                <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16 relative z-10">
                        {/* Org Icon */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500 rounded-[35px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                            <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-[40px] bg-white border-8 border-white shadow-2xl flex items-center justify-center relative z-10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-90" />
                                <Building2 className="w-16 h-16 lg:w-24 lg:h-24 text-white relative z-20" />
                            </div>
                        </div>

                        <div className="flex-1 text-center lg:text-left space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                        {org.name}
                                    </h1>
                                    <div className="flex items-center gap-2 mx-auto lg:mx-0">
                                        <Badge className="bg-blue-600 text-white border-none py-1.5 px-4 font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-blue-200">
                                            {ORGANIZATION_TYPE_LABELS[org.type as string] || org.type}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-2 font-black"><MapPin className="w-4 h-4 text-blue-500" /> {org.address || "Deutschland"}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-2 font-black"><Globe className="w-4 h-4 text-blue-500" /> {org.website || "N/A"}</span>
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-start gap-4 pt-2">
                                <OrganizationQuickAdd
                                    organizationId={org.id}
                                    organizationName={org.name}
                                    allDeals={allDeals}
                                />
                                <OrganizationActions organization={{
                                    id: org.id,
                                    name: org.name,
                                    industry: org.industry,
                                    type: org.type,
                                    address: org.address,
                                    description: org.description,
                                    website: org.website,
                                    ticketSizeMin: org.ticketSizeMin,
                                    ticketSizeMax: org.ticketSizeMax,
                                    aum: org.aum,
                                }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Info Column */}
                    <div className="space-y-8">
                        {/* Info Card */}
                        <Card className="rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                            <CardHeader className="pt-10 pb-6 px-8">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Unternehmensprofil</CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-10 space-y-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branche</p>
                                    <p className="text-base font-black text-slate-900">{org.industry || "N/A"}</p>
                                </div>
                                {org.description && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Über das Unternehmen</p>
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                                            "{org.description}"
                                        </p>
                                    </div>
                                )}
                                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mandate</p>
                                        <p className="text-2xl font-black text-slate-900">{org.investorDeals.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kontakte</p>
                                        <p className="text-2xl font-black text-slate-900">{org.contacts.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Content Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Contacts Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    Zugeordnete Personen
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {org.contacts.map((contact: any) => (
                                    <ContactCard key={contact.id} contact={contact} />
                                ))}
                                {org.contacts.length === 0 && (
                                    <div className="col-span-full py-20 text-center rounded-[40px] border-2 border-dashed border-slate-100 bg-white/50">
                                        <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Keine Kontakte hinterlegt</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mandate Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                                    <Briefcase className="w-5 h-5 text-indigo-500" />
                                    Projektbeteiligungen
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {org.investorDeals.map((id: any) => (
                                    <Link key={id.deal.id} href={`/deals/${id.deal.id}`} className="group block">
                                        <div className="p-6 rounded-[35px] border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[25px] bg-slate-50 flex items-center justify-center font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-xl shadow-inner">
                                                    {id.deal.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{id.deal.name}</p>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase border-slate-200 text-slate-400 group-hover:border-blue-100 group-hover:text-blue-500">
                                                            {DEAL_STATUS_LABELS[id.deal.status as string] || id.deal.status}
                                                        </Badge>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {DEAL_TYPE_LABELS[id.deal.type as string] || id.deal.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-slate-900 tabular-nums">
                                                    {id.deal.feeSuccess ? id.deal.feeSuccess.toLocaleString('de-DE') : (id.deal.expectedValue ? id.deal.expectedValue.toLocaleString('de-DE') : "---")} €
                                                </p>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Success Fee</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {org.investorDeals.length === 0 && (
                                    <div className="py-20 text-center rounded-[40px] border-2 border-dashed border-slate-100 bg-white/50">
                                        <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Bisher keine Mandatshistorie</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Company Feed Section */}
                        <OrganizationFeed
                            activities={(org as any).activities || []}
                            comments={(org as any).comments || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
