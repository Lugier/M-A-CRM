import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-50/30">
            {/* Header Skeleton */}
            <div className="flex-none p-4 lg:p-6 pb-2 lg:pb-3 flex items-center justify-between bg-white/40 backdrop-blur-sm border-b border-slate-200">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Scrollable Content Skeleton */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* KPI Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-slate-200/60 shadow-sm bg-white/70">
                            <CardContent className="p-5 flex items-start justify-between">
                                <div className="space-y-3">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pipeline Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 border-b px-4">
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <Skeleton className="h-32 w-full rounded-xl" />
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-2 w-full" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity Skeleton */}
                        <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 border-b px-4">
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent className="p-0">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-10 w-10 rounded-xl" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-5 w-5 rounded-full" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side Column Skeleton */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 border-b px-4">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent className="p-2 grid grid-cols-2 gap-2">
                                <Skeleton className="h-20 w-full rounded-xl" />
                                <Skeleton className="h-20 w-full rounded-xl" />
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                            <CardHeader className="py-3 border-b px-4">
                                <Skeleton className="h-4 w-16" />
                            </CardHeader>
                            <CardContent className="p-0">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 border-b border-slate-100 last:border-0">
                                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <Skeleton className="h-1.5 w-full rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
