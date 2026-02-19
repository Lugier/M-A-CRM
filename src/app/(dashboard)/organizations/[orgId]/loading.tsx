import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="flex flex-col gap-8 p-4 lg:p-10 max-w-[1400px] mx-auto">
                {/* Navigation Skeleton */}
                <Skeleton className="h-10 w-48 rounded-xl" />

                {/* Main Header Card Skeleton */}
                <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16 relative z-10">
                        {/* Org Icon Skeleton */}
                        <Skeleton className="w-32 h-32 lg:w-44 lg:h-44 rounded-[40px]" />

                        <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <Skeleton className="h-12 w-full max-w-md" />
                                    <Skeleton className="h-6 w-32 rounded-full" />
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-start gap-4 pt-2">
                                <Skeleton className="h-10 w-32 rounded-lg" />
                                <Skeleton className="h-10 w-32 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Info Column Skeleton */}
                    <div className="space-y-8">
                        <Card className="rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                            <CardHeader className="pt-10 pb-6 px-8">
                                <Skeleton className="h-3 w-32" />
                            </CardHeader>
                            <CardContent className="px-8 pb-10 space-y-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-2 w-16" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Content Column Skeleton */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="space-y-6">
                            <div className="px-4">
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-[25px]" />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="px-4">
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <Skeleton key={i} className="h-32 w-full rounded-[35px]" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
