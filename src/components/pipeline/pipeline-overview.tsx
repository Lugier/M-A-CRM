"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

import { DEAL_STAGE_LABELS } from "@/lib/constants";

export function PipelineOverview({ deals }: { deals: any[] }) {
    const STAGES = ["PITCH", "MANDATE", "CLOSING"];
    const STAGE_LABELS = DEAL_STAGE_LABELS;

    const data = useMemo(() => {
        return STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const count = stageDeals.length;
            const volume = stageDeals.reduce((acc, d) => acc + (d.feeSuccess || 0), 0);
            return { stage, label: STAGE_LABELS[stage], count, volume };
        });
    }, [deals]);

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-4">
            {data.map(({ stage, label, count, volume }) => (
                <div key={stage} className="flex items-center gap-3 group">
                    <div className="w-32 text-[10px] font-bold text-slate-500 text-right uppercase tracking-wider shrink-0">
                        {label}
                    </div>
                    <div className="flex-1 h-8 bg-slate-50 rounded-lg overflow-hidden relative">
                        <div
                            className="h-full bg-blue-500 rounded-lg transition-all duration-500 group-hover:bg-blue-600 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((count / maxCount) * 100, 2)}%` }}
                        >
                            {count > 0 && <span className="text-xs font-bold text-white">{count}</span>}
                        </div>
                    </div>
                    <div className="w-20 text-xs font-bold text-slate-700 text-right">
                        {(volume / 1000000).toFixed(1)}M €
                    </div>
                </div>
            ))}

            {deals.length === 0 && (
                <div className="text-center py-8">
                    <BarChart3 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Keine Deals in der Pipeline</p>
                </div>
            )}
        </div>
    );
}
