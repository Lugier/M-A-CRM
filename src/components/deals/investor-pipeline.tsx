"use client";

import { useMemo, useState, useEffect } from "react";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { updateInvestorStatusAction } from "@/app/actions/deal-details";
import { updateInvestorStage } from "@/app/actions/investor-workflow";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Building2, MessageSquare, Mail, CheckCircle2, XCircle, FileText, Send, PieChart, Users, Eye, Kanban, Table as TableIcon, LayoutList } from "lucide-react";
import { OutreachDialog } from "@/components/deals/outreach-dialog";
import { LonglistTable } from "@/components/deals/longlist-table"; // Assuming this component exists based on file list

const STAGES = ["LONGLIST", "SHORTLIST", "CONTACTED", "NDA_SENT", "NDA_SIGNED", "IM_SENT", "BID_RECEIVED", "DROPPED"];

const STAGE_LABELS: Record<string, string> = {
    LONGLIST: "Longlist",
    SHORTLIST: "Shortlist",
    CONTACTED: "Angesprochen",
    NDA_SENT: "NDA Versendet",
    NDA_SIGNED: "NDA Unterz.",
    IM_SENT: "Info Memo",
    BID_RECEIVED: "Angebot",
    DROPPED: "Abgesagt/Pass"
};

type Investor = {
    organizationId: string;
    dealId: string;
    organization: { name: string; industry?: string | null };
    status: string;
    feedback?: string | null;
    emailSentAt?: Date | string | null;
    contactedVia?: string | null;
    notes?: string | null;
};

export function InvestorPipeline({ initialInvestors, deal }: { initialInvestors: Investor[], deal: any }) {
    const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
    const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Outreach Dialog State
    const [outreachOpen, setOutreachOpen] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Analytics Calculation
    const analytics = useMemo(() => {
        const total = investors.length;
        const contacted = investors.filter(i => ["CONTACTED", "NDA_SENT", "NDA_SIGNED", "IM_SENT", "BID_RECEIVED"].includes(i.status)).length;
        const nda = investors.filter(i => ["NDA_SIGNED", "IM_SENT", "BID_RECEIVED"].includes(i.status)).length;
        const bids = investors.filter(i => i.status === "BID_RECEIVED").length;

        return {
            total,
            contacted,
            contactedRate: total ? Math.round((contacted / total) * 100) : 0,
            nda,
            ndaRate: contacted ? Math.round((nda / contacted) * 100) : 0,
            bids
        };
    }, [investors]);

    const columns = STAGES;

    const investorsByColumn = useMemo(() => {
        const map: Record<string, Investor[]> = {};
        columns.forEach(col => map[col] = []);
        investors.forEach(inv => {
            const status = inv.status || "LONGLIST";
            const mappedStatus = STAGES.includes(status) ? status : "LONGLIST";

            if (map[mappedStatus]) {
                map[mappedStatus].push(inv);
            } else if (map["LONGLIST"]) {
                map["LONGLIST"].push(inv);
            }
        });
        return map;
    }, [investors, columns]);

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeOrgId = active.id as string;
        const overId = over.id as string;

        const activeInv = investors.find(i => i.organizationId === activeOrgId);
        if (!activeInv) return;

        let newStatus = overId;

        if (!STAGES.includes(overId)) {
            const overInv = investors.find(i => i.organizationId === overId);
            if (overInv) newStatus = overInv.status;
            else return;
        }

        if (activeInv.status !== newStatus) {
            // Trigger Outreach Dialog if moving to CONTACTED and not already contacted via email
            if (newStatus === "CONTACTED" && (!activeInv.contactedVia || activeInv.contactedVia !== 'email')) {
                setSelectedInvestor(activeInv);
                setOutreachOpen(true);
            }

            const originalStatus = activeInv.status;

            // Optimistic Update
            setInvestors(prev => prev.map(i =>
                i.organizationId === activeOrgId ? { ...i, status: newStatus } : i
            ));

            try {
                // If it's NOT a contacted status that triggers dialog, update immediately with new action
                if (newStatus !== "CONTACTED") {
                    const result = await updateInvestorStage(deal.id, activeOrgId, newStatus);
                    if (result?.error) {
                        toast.error(result.error);
                        setInvestors(prev => prev.map(i => i.organizationId === activeOrgId ? { ...i, status: originalStatus } : i));
                    } else {
                        toast.success(`${activeInv.organization.name} Status aktualisiert`);
                    }
                }
            } catch (e) {
                toast.error("Fehler beim Aktualisieren");
                setInvestors(prev => prev.map(i => i.organizationId === activeOrgId ? { ...i, status: originalStatus } : i));
            }
        }
    }

    const activeInv = activeId ? investors.find(i => i.organizationId === activeId) : null;

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Analytics Bar & Controls */}
            <div className="flex flex-col gap-4 shrink-0">
                <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    {/* Analytics Items */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Kandidaten</p>
                            <p className="text-lg font-bold text-slate-800">{analytics.total}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Angesprochen</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-lg font-bold text-slate-800">{analytics.contacted}</p>
                                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-1.5 rounded">{analytics.contactedRate}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">NDA Unterz.</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-lg font-bold text-slate-800">{analytics.nda}</p>
                                <span className="text-xs text-slate-500">{analytics.ndaRate}% Konv.</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Angebote</p>
                            <p className="text-lg font-bold text-slate-800">{analytics.bids}</p>
                        </div>
                    </div>
                </div>

                {/* View Toggles */}
                <div className="flex justify-between items-center px-1">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="KANBAN" className="flex items-center gap-2">
                                <Kanban className="w-4 h-4" /> Board
                            </TabsTrigger>
                            <TabsTrigger value="TABLE" className="flex items-center gap-2">
                                <TableIcon className="w-4 h-4" /> Liste
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {viewMode === 'TABLE' && (
                        <Button size="sm" variant="outline" className="gap-2">
                            <LayoutList className="w-4 h-4" /> Spalten anpassen
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {viewMode === 'KANBAN' ? (
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="flex space-x-4 h-full overflow-x-auto pb-4 custom-scrollbar items-start px-1">
                            {columns.map(stage => (
                                <Column
                                    key={stage}
                                    id={stage}
                                    title={STAGE_LABELS[stage] || stage}
                                    investors={investorsByColumn[stage] || []}
                                    onOutreach={(inv) => {
                                        setSelectedInvestor(inv);
                                        setOutreachOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                        {isMounted && createPortal(
                            <DragOverlay>
                                {activeInv ? (
                                    <InvestorCard investor={activeInv} isOverlay />
                                ) : null}
                            </DragOverlay>,
                            document.body
                        )}
                    </DndContext>
                ) : (
                    <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {/* 
                           Passing full investors list to table. 
                           Ideally LonglistTable handles its own filtering or we pass it here.
                        */}
                        <LonglistTable data={investors} dealId={deal.id} />
                    </div>
                )}
            </div>

            {/* Outreach Dialog */}
            {selectedInvestor && (
                <OutreachDialog
                    isOpen={outreachOpen}
                    onClose={() => {
                        setOutreachOpen(false);
                        setSelectedInvestor(null);
                    }}
                    investor={selectedInvestor}
                    deal={deal}
                />
            )}
        </div>
    );
}

function Column({ id, title, investors, onOutreach }: { id: string, title: string, investors: Investor[], onOutreach?: (inv: Investor) => void }) {
    const { setNodeRef } = useDroppable({ id });
    const isNegative = id === "DROPPED";
    const isPositive = id === "NDA_SIGNED" || id === "BID_RECEIVED";

    return (
        <div ref={setNodeRef} className={cn(
            "flex flex-col w-72 rounded-xl border shadow-sm backdrop-blur-sm h-full max-h-full shrink-0 flex-nowrap",
            isNegative ? "bg-rose-50/30 border-rose-100" :
                isPositive ? "bg-emerald-50/30 border-emerald-100" : "bg-slate-50/50 border-slate-200"
        )}>
            <div className={cn(
                "flex items-center justify-between p-3 border-b rounded-t-xl",
                isNegative ? "bg-rose-50/50 border-rose-100" :
                    isPositive ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-100/50 border-slate-200"
            )}>
                <h3 className={cn("text-xs font-bold uppercase tracking-wider",
                    isNegative ? "text-rose-700" : isPositive ? "text-emerald-700" : "text-slate-600"
                )}>
                    {title}
                </h3>
                <span className="bg-white/80 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/5 shadow-sm">
                    {investors.length}
                </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar p-2">
                <SortableContext items={investors.map(i => i.organizationId)} strategy={verticalListSortingStrategy}>
                    {investors.map(inv => (
                        <DraggableInvestorCard key={inv.organizationId} investor={inv} onOutreach={onOutreach} />
                    ))}
                </SortableContext>
                {investors.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300/50 rounded-lg bg-slate-50/30">
                        <span className="text-[10px] italic">Keine Investoren</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function DraggableInvestorCard({ investor, onOutreach }: { investor: Investor, onOutreach?: (inv: Investor) => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: investor.organizationId,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("touch-none", isDragging && "opacity-50 blur-[1px]")}>
            <InvestorCard investor={investor} onOutreach={onOutreach} />
        </div>
    );
}

function InvestorCard({ investor, isOverlay, onOutreach }: { investor: Investor, isOverlay?: boolean, onOutreach?: (inv: Investor) => void }) {
    return (
        <Card className={cn(
            "cursor-grab transition-all duration-200 group relative select-none overflow-hidden",
            isOverlay ? "shadow-2xl rotate-2 scale-105 z-50 cursor-grabbing border-blue-500 bg-white ring-2 ring-blue-200" : "bg-white hover:shadow-md border-slate-100 hover:border-blue-300"
        )}>
            {/* Status Indicators */}
            {investor.status === 'CONTACTED' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />}
            {investor.status === 'NDA_SIGNED' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
            {investor.status === 'BID_RECEIVED' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}

            <CardContent className="p-3 pl-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 overflow-hidden">
                        <div className="mt-0.5 w-7 h-7 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-xs ring-1 ring-slate-200/50">
                            {investor.organization.name.substring(0, 1)}
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate leading-tight group-hover:text-blue-700 transition-colors">{investor.organization.name}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{investor.organization.industry || "Branche n/a"}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-50 justify-between items-center">
                    <div className="flex gap-2">
                        {investor.contactedVia === 'email' && (
                            <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                <Mail className="w-2.5 h-2.5" /> Mail
                            </div>
                        )}
                    </div>
                    {investor.status === 'LONGLIST' && !isOverlay && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOutreach?.(investor);
                                }}
                                className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full hover:bg-blue-100 font-medium flex items-center gap-1 cursor-pointer"
                            >
                                <Send className="w-2.5 h-2.5" /> Ansprechen
                            </button>
                        </div>
                    )}
                    {investor.status === 'NDA_SENT' && !isOverlay && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    toast.promise(updateInvestorStage(investor.dealId, investor.organizationId, "NDA_SIGNED"), {
                                        loading: "Aktualisiere...",
                                        success: "NDA als unterschrieben markiert",
                                        error: "Fehler"
                                    });
                                }}
                                className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full hover:bg-indigo-100 font-medium flex items-center gap-1 cursor-pointer"
                            >
                                <FileText className="w-2.5 h-2.5" /> NDA Unterschrieben
                            </button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
