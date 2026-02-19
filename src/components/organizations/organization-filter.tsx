"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";

const FILTER_OPTIONS = [
    { value: "ALL", label: "Alle Typen" },
    ...Object.entries(ORGANIZATION_TYPE_LABELS).map(([value, label]) => ({ value, label }))
];

export function OrganizationFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentType = searchParams.get("type") || "ALL";

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "ALL") {
            params.delete("type");
        } else {
            params.set("type", value);
        }
        router.push(`/organizations?${params.toString()}`);
    }

    return (
        <div className="w-[200px]">
            <Select value={currentType} onValueChange={handleChange}>
                <SelectTrigger className="bg-white border-slate-200 h-9 text-xs font-bold uppercase tracking-widest text-slate-600">
                    <SelectValue placeholder="Filter nach Typ" />
                </SelectTrigger>
                <SelectContent>
                    {FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
