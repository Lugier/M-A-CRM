"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { updateDealStage } from "@/app/actions/deals";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STAGES = ["PITCH", "MANDATE", "CLOSING"];

const STAGE_LABELS: Record<string, string> = {
    PITCH: "Lead / Pitch",
    MANDATE: "Mandat / Execution",
    CLOSING: "Closing / Portfolio"
};

type Deal = {
    id: string;
    stage: string;
    name: string;
    expectedValue: number | null;
    feeRetainer: number | null;
    feeSuccess: number | null;
    lead: { lastName: string, internalOwner?: { id: string, initials: string, avatarColor: string, name: string } | null } | null;
    teamMembers: { user: { id: string, initials: string, avatarColor: string, name: string } }[];
    tasks: { id: string }[];
};

export function KanbanBoard({ initialDeals }: { initialDeals: Deal[] }) {
    const [deals, setDeals] = useState<Deal[]>(initialDeals);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columns = STAGES;

    const dealsByColumn = useMemo(() => {
        const map: Record<string, Deal[]> = {};
        STAGES.forEach(col => map[col] = []);
        deals.forEach(deal => {
            if (map[deal.stage]) {
                map[deal.stage].push(deal);
            }
        });
        return map;
    }, [deals]);

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeDeal = deals.find(d => d.id === activeId);
        if (!activeDeal) return;

        let newStage = overId;

        if (!STAGES.includes(overId)) {
            const overDeal = deals.find(d => d.id === overId);
            if (overDeal) {
                newStage = overDeal.stage;
            } else {
                return;
            }
        }

        if (activeDeal.stage !== newStage) {
            const originalStage = activeDeal.stage;
            // Optimistic update
            const updatedDeals = deals.map(d =>
                d.id === activeId ? { ...d, stage: newStage } : d
            );
            setDeals(updatedDeals);

            try {
                const result = await updateDealStage(activeId, newStage);
                if (result && typeof result === 'object' && 'error' in result && result.error) {
                    toast.error(result.error as string);
                    setDeals(deals.map(d => d.id === activeId ? { ...d, stage: originalStage } : d));
                } else {
                    toast.success(`${activeDeal.name} verschoben nach ${STAGE_LABELS[newStage]}`);
                }
            } catch (e) {
                toast.error("Verbindungsfehler");
                setDeals(deals.map(d => d.id === activeId ? { ...d, stage: originalStage } : d));
            }
        }
    }

    const activeDeal = activeId ? deals.find(d => d.id === activeId) : null;

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex space-x-6 h-full min-w-max pb-4">
                        {columns.map(stage => (
                            <Column
                                key={stage}
                                id={stage}
                                title={STAGE_LABELS[stage] || stage}
                                deals={dealsByColumn[stage] || []}
                            />
                        ))}
                    </div>
                    {isMounted && createPortal(
                        <DragOverlay>
                            {activeDeal ? (
                                <DealCard deal={activeDeal} isOverlay />
                            ) : null}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </div>
    );
}

function Column({ id, title, deals }: { id: string, title: string, deals: Deal[] }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex flex-col w-96 bg-slate-100/30 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-md h-full max-h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500/80 dark:text-slate-400">
                    {title}
                </h3>
                <span className="bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-200 px-3 py-1 rounded-full text-[10px] font-black shadow-sm border border-slate-100 dark:border-slate-700">
                    {deals.length}
                </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1 min-h-[100px]">
                <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {deals.map(deal => (
                        <DraggableDealCard key={deal.id} deal={deal} />
                    ))}
                </SortableContext>
                {deals.length === 0 && (
                    <div className="h-40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400 italic gap-2 opacity-50">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                        </div>
                        Keine Deals
                    </div>
                )}
            </div>
        </div>
    );
}

// Re-using Plus icon
import { Plus } from "lucide-react";

function DraggableDealCard({ deal }: { deal: Deal }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: deal.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("touch-none", isDragging && "opacity-50 grayscale")}>
            <DealCard deal={deal} />
        </div>
    );
}

function DealCard({ deal, isOverlay }: { deal: Deal, isOverlay?: boolean }) {
    const formatValue = (val: number | null) => val ? `${(val / 1000).toFixed(0)}k` : "–";
    const openTaskCount = deal.tasks?.length || 0;
    const team = deal.teamMembers?.map(tm => tm.user) || [];

    return (
        <Link href={`/deals/${deal.id}`} className="block" onClick={(e) => {
            if (isOverlay) e.preventDefault();
        }}>
            <Card className={cn(
                "cursor-grab border transition-all duration-500 group relative overflow-hidden",
                isOverlay ? "shadow-2xl rotate-2 scale-105 bg-white z-50 cursor-grabbing border-blue-500 ring-4 ring-blue-500/20" : "bg-white hover:shadow-2xl hover:border-blue-400/30 border-slate-200/60 shadow-sm",
                "dark:bg-slate-950 dark:border-slate-800 rounded-2xl"
            )}>
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="p-5 pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-black text-slate-900 dark:text-slate-200 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {deal.name}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">Retainer</span>
                            <span className="text-slate-900 font-black">{formatValue(deal.feeRetainer)}</span>
                        </div>

                        <div className="w-px h-6 bg-slate-100" />

                        <div className="flex flex-col">
                            <span className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">Success</span>
                            <span className="text-emerald-600 font-black">{formatValue(deal.feeSuccess)}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium uppercase text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                        <div className="flex items-center -space-x-2 pl-1">
                            {deal.lead?.internalOwner && (
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-[10px] font-black text-white shadow-md z-10"
                                    style={{ backgroundColor: deal.lead.internalOwner.avatarColor || '#d97706' }}
                                    title={`Bachert Bezugsperson: ${deal.lead.internalOwner.name}`}
                                >
                                    {deal.lead.internalOwner.initials}
                                </div>
                            )}
                            {team.filter(u => u.id !== deal.lead?.internalOwner?.id).length > 0 ? (
                                team.filter(u => u.id !== deal.lead?.internalOwner?.id).map((user) => (
                                    <div
                                        key={user.id}
                                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm"
                                        style={{ backgroundColor: user.avatarColor || '#94a3b8' }}
                                        title={user.name}
                                    >
                                        {user.initials}
                                    </div>
                                ))
                            ) : (!deal.lead?.internalOwner && (
                                <div className="text-[10px] italic text-slate-300 pl-1 font-bold">Kein Team</div>
                            ))}
                        </div>
                        {openTaskCount > 0 ? (
                            <Badge className="px-2 py-0.5 h-6 text-[9px] bg-amber-50 text-amber-700 border-amber-200 border shadow-none font-black uppercase tracking-widest">
                                {openTaskCount} Offen
                            </Badge>
                        ) : (
                            <span className="text-[9px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Clean
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
