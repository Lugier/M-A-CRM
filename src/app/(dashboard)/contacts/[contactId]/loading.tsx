import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            {/* Header Skeleton */}
            <div className="flex-none mb-6">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex-none mb-6">
                <Skeleton className="h-10 w-96 rounded-lg" />
            </div>

            <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column Skeleton */}
                    <div className="space-y-6">
                        <Card className="border-slate-200">
                            <CardHeader className="py-3 px-6 border-b">
                                <Skeleton className="h-4 w-32" />
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-2 w-16" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200">
                            <CardHeader className="py-3 px-6 border-b">
                                <Skeleton className="h-4 w-40" />
                            </CardHeader>
                            <CardContent className="p-0">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 border-b border-slate-100 last:border-0 flex justify-between items-center">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                        <Skeleton className="h-8 w-8 rounded-lg" />
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
