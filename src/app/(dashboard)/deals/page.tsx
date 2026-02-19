import { getDeals } from "@/app/actions/deals";
import { CreateDealDialog } from "@/components/deals/create-deal-dialog";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function DealsPage() {
    const deals = await getDeals();

    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            <div className="flex items-center justify-between flex-shrink-0 mb-6">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deal Pipeline</h1>
                    <p className="text-slate-500 text-sm">Verwalten Sie Ihre aktiven Mandate und Projekte per Drag & Drop.</p>
                </div>
                <CreateDealDialog />
            </div>

            <Tabs defaultValue="current" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-fit mb-4 bg-white/50 border border-slate-200">
                    <TabsTrigger value="current" className="font-bold">Aktuelle Mandate</TabsTrigger>
                    <TabsTrigger value="archive" className="font-bold">Archiv / Abgeschlossen</TabsTrigger>
                </TabsList>

                <TabsContent value="current" className="flex-1 min-h-0 mt-0">
                    <div className="h-full overflow-x-auto custom-scrollbar pb-2">
                        {/* We cast deals to any because of the specific relation types, keeping it pragmatic for now */}
                        <KanbanBoard initialDeals={deals.filter((d: any) => d.status !== 'CLOSED_WON' && d.status !== 'CLOSED_LOST') as any} />
                    </div>
                </TabsContent>

                <TabsContent value="archive" className="flex-1 min-h-0 mt-0 overflow-y-auto">
                    {/* Placeholder for Archive List - we can implement a proper DataTable later */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">Name</th>
                                        <th className="px-6 py-3 font-bold">Typ</th>
                                        <th className="px-6 py-3 font-bold">Status</th>
                                        <th className="px-6 py-3 font-bold text-right">Wert</th>
                                        <th className="px-6 py-3 font-bold text-right">Team</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {deals.filter((d: any) => d.status === 'CLOSED_WON' || d.status === 'CLOSED_LOST').map((deal: any) => (
                                        <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <Link href={`/deals/${deal.id}`} className="hover:text-blue-600 hover:underline">
                                                    {deal.name}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">{deal.type}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn(
                                                    "border-none px-2 py-0.5 uppercase text-[10px] font-bold",
                                                    deal.status === 'CLOSED_WON' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                                )}>
                                                    {deal.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-600 font-medium">
                                                {deal.expectedValue ? `${(deal.expectedValue / 1000000).toFixed(1)}M €` : "–"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end -space-x-2">
                                                    {deal.teamMembers?.map((tm: any) => (
                                                        <div key={tm.user.id} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600" title={tm.user.name}>
                                                            {tm.user.initials}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {deals.filter((d: any) => d.status === 'CLOSED_WON' || d.status === 'CLOSED_LOST').length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                                Keine archivierten Deals gefunden.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
