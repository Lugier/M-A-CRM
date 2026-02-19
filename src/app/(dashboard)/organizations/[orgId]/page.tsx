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

export default async function OrganizationDetailPage({ params }: { params: { orgId: string } }) {
    const org = await getOrganizationById(params.orgId);

    if (!org) {
        notFound();
    }

    const allDeals = await getDeals();

    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            {/* Header */}
            <div className="flex-none mb-6">
                <BackButton label="Zurück zu Organisationen" />
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{org.name}</h1>
                        <div className="flex items-center gap-3 mt-1.5 text-slate-500">
                            <span className="flex items-center gap-1.5 text-sm font-medium"><Building2 className="w-4 h-4 text-slate-400" /> {org.industry || "Unbekannte Branche"}</span>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none uppercase text-[9px] font-bold tracking-widest px-1.5 px-2">
                                {org.type === "BUYER" ? "Stratege" : org.type === "PE_FUND" ? "FI" : org.type === "VC" ? "VC" : "Family Office"}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
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

            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details & Info */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-500" />
                                    Unternehmensinfo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 lg:p-6 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branche</p>
                                    <p className="text-sm font-bold text-slate-800">{org.industry || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Website</p>
                                    {org.website ? (
                                        <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} target="_blank" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5" /> {org.website}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Nicht angegeben</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hauptsitz</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {org.address || "Deutschland"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {org.description && (
                            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white/50 border-dashed">
                                <CardHeader className="py-2.5 px-6 border-b bg-slate-50/30">
                                    <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-3 h-3" /> Beschreibung
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 text-xs text-slate-600 leading-relaxed font-medium">
                                    {org.description}
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-indigo-500" />
                                    M&A Historie
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 lg:p-6">
                                <div className="text-2xl font-bold text-slate-900">{org.investorDeals.length}</div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Verknüpfte Projekte</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Contacts and Deals */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contacts Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Kontakte ({org.contacts.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {org.contacts.map((contact: any) => (
                                    <ContactCard key={contact.id} contact={contact} />
                                ))}
                                {org.contacts.length === 0 && (
                                    <p className="col-span-full py-6 text-center text-slate-400 text-xs font-bold bg-white border border-dashed border-slate-200 rounded-xl">Keine Kontakte hinterlegt.</p>
                                )}
                            </div>
                        </div>

                        {/* Deals Section */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-indigo-500" />
                                Zugehörige Mandate
                            </h2>
                            <div className="space-y-2">
                                {org.investorDeals.map((id: any) => {
                                    const deal = id.deal;
                                    return (
                                        <Link key={deal.id} href={`/deals/${deal.id}`}>
                                            <div className="flex items-center justify-between p-3 lg:p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-3 lg:gap-4">
                                                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm">
                                                        {deal.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{deal.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-400 border-slate-200">{deal.status}</Badge>
                                                            <span className="text-[10px] text-slate-400 font-medium">{deal.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs lg:text-sm font-bold text-slate-800">{deal.expectedValue?.toLocaleString('de-DE')} €</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Volumen</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {org.investorDeals.length === 0 && (
                                    <p className="py-6 text-center text-slate-400 text-xs font-bold bg-white border border-dashed border-slate-200 rounded-xl">Bisher keine Mandate.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
