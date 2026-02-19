import { getDealById } from "@/app/actions/deal-details";
import { getOrganizations } from "@/app/actions/organizations";
import { getUsers } from "@/app/actions/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Calendar, FileText, DollarSign, Zap, ShieldCheck, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { LonglistAddDialog } from "@/components/deals/longlist-add-dialog";
import { ShareStatusDialog } from "@/components/deals/share-status-dialog";
import { LonglistTable } from "@/components/deals/longlist-table";
import { DealActions } from "@/components/deals/deal-actions";
import { StageSelector } from "@/components/deals/stage-selector";
import { DealKPIs } from "@/components/deals/deal-kpis";
import { DocumentLinks } from "@/components/deals/document-links";
import { DealCalendar } from "@/components/deals/deal-calendar";
import { AiInvestorMatch } from "@/components/deals/ai-investor-match";
import { LonglistAnalysis } from "@/components/deals/longlist-analysis";
import { ProjectPlan } from "@/components/deals/project-plan";

export default async function DealDetailPage({ params }: { params: { dealId: string } }) {
    const deal = (await getDealById(params.dealId)) as any;
    const organizations = await getOrganizations();
    const users = await getUsers();

    if (!deal) notFound();

    // Find the internal owner of the lead contact
    const internalOwner = deal.lead?.internalOwner;

    return (
        <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden">
            {/* Header */}
            <div className="flex-none p-4 lg:p-6 pb-2 lg:pb-3 flex items-start justify-between bg-white/40 backdrop-blur-sm border-b border-slate-200">
                <div className="space-y-0.5">
                    <BackButton label="Mandate" className="mb-1" />
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{deal.name}</h1>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[9px] py-0 px-1.5 h-5">{deal.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-slate-500 font-medium mt-1">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {deal.type}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {deal.createdAt.toLocaleDateString("de-DE")}</span>

                        {internalOwner && (
                            <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">Bachert Bezugsperson:</span>
                                <span className="text-slate-900 font-bold">{internalOwner.name}</span>
                            </div>
                        )}
                        {!internalOwner && deal.lead && (
                            <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">Mandant:</span>
                                <span className="text-slate-700 font-semibold">{deal.lead.firstName} {deal.lead.lastName}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DealActions deal={{
                        id: deal.id, name: deal.name, type: deal.type, status: deal.status,
                        expectedValue: deal.expectedValue, probability: deal.probability,
                        feeRetainer: deal.feeRetainer, feeSuccess: deal.feeSuccess,
                    }} />
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <ShareStatusDialog deal={deal} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 border-l">Aktuelle Phase</span>
                        <StageSelector dealId={deal.id} currentStage={deal.stage} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="bg-white px-4 border-b border-slate-200 flex-none z-10 shadow-sm">
                    <TabsList className="bg-transparent h-11 w-full justify-start gap-8">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2.5 font-bold text-slate-400 data-[state=active]:text-blue-700 text-sm transition-all focus:ring-0">Übersicht & Plan</TabsTrigger>
                        <TabsTrigger value="longlist" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2.5 font-bold text-slate-400 data-[state=active]:text-blue-700 text-sm transition-all focus:ring-0">Longlist ({deal.investors.length})</TabsTrigger>
                        <TabsTrigger value="analysis" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2.5 font-bold text-slate-400 data-[state=active]:text-blue-700 text-sm transition-all focus:ring-0">Fortschritts-Analyse</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden relative min-h-0 bg-transparent">
                    {/* OVERVIEW TAB -> Master Data & Project Plan */}
                    <TabsContent value="overview" className="absolute inset-0 m-0 overflow-y-auto p-4 lg:p-6 space-y-8 data-[state=inactive]:hidden text-sm bg-white/60 custom-scrollbar pb-20">
                        {/* Transaction Master Data Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3 uppercase">
                                    <div className="p-2 bg-slate-900 rounded-lg shadow-lg">
                                        <Briefcase className="w-5 h-5 text-white" />
                                    </div>
                                    Transaktions-Stammdaten
                                </h3>
                            </div>

                            {/* Deal KPI Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
                                    <CardHeader className="pb-1 bg-slate-50/80 border-b py-2 px-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fixum / Retainer</CardTitle>
                                        <Building2 className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardHeader>
                                    <CardContent className="pt-3 px-4 pb-3">
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-xl lg:text-2xl font-bold text-slate-900">
                                                {deal.feeRetainer ? `${deal.feeRetainer.toLocaleString('de-DE')} €` : "–"}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">monatlich</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
                                    <CardHeader className="pb-1 bg-slate-50/80 border-b py-2 px-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Success Fee</CardTitle>
                                        <DollarSign className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardHeader>
                                    <CardContent className="pt-3 px-4 pb-3">
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-xl lg:text-2xl font-bold text-emerald-600">
                                                {deal.feeSuccess ? `${deal.feeSuccess.toLocaleString('de-DE')} €` : "–"}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
                                    <CardHeader className="pb-1 bg-slate-50/80 border-b py-2 px-4 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Prozess-Konvertierung</CardTitle>
                                        <Zap className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardHeader>
                                    <CardContent className="pt-3 px-4 pb-3">
                                        {(() => {
                                            const total = deal.investors.length;
                                            const signed = deal.investors.filter((i: any) => i.ndaSignedAt || i.status === "NDA_SIGNED" || i.status === "IM_SENT" || i.status === "DATA_ROOM_ACCESS" || i.status === "LOI" || i.status === "BID_RECEIVED").length;
                                            const rate = total > 0 ? (signed / total) * 100 : 0;
                                            return (
                                                <>
                                                    <div className="flex items-baseline gap-2">
                                                        <div className="text-xl lg:text-2xl font-bold text-slate-900">
                                                            {signed} / {total}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 capitalize">Signed NDAs</span>
                                                    </div>
                                                    <div className="mt-2 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            </div>

                            <DealKPIs deal={deal} />
                        </div>

                        {/* Project Plan Section */}
                        <div className="pt-8 border-t border-slate-200/60">
                            <ProjectPlan deal={deal} allUsers={users} />
                        </div>
                    </TabsContent>

                    {/* LONGLIST TAB */}
                    <TabsContent value="longlist" className="absolute inset-0 m-0 flex flex-col min-h-0 data-[state=inactive]:hidden bg-white/60">
                        <div className="flex justify-between items-center px-4 lg:px-6 py-4 flex-none border-b border-slate-100 bg-white/40">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Investoren Longlist</h3>
                                <p className="text-xs text-slate-500 font-medium">Verwalten Sie Ihre Zielinvestoren und den Kontaktstatus.</p>
                            </div>
                            <LonglistAddDialog
                                dealId={deal.id}
                                organizations={organizations}
                                existingInvestorIds={deal.investors.map((inv: any) => inv.organizationId)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-0 space-y-6 custom-scrollbar">
                            <AiInvestorMatch dealId={deal.id} dealName={deal.name} industry={deal.targetSubIndustry || undefined} />
                            <LonglistTable data={deal.investors} dealId={deal.id} />
                        </div>
                    </TabsContent>

                    {/* ANALYSIS TAB */}
                    <TabsContent value="analysis" className="absolute inset-0 m-0 overflow-y-auto p-4 lg:p-6 pb-0 space-y-6 data-[state=inactive]:hidden bg-white/60 custom-scrollbar">
                        <LonglistAnalysis investors={deal.investors || []} dealId={deal.id} documents={deal.documents || []} />
                    </TabsContent>

                </div>
            </Tabs>
        </div>
    );
}
