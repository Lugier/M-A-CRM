"use client";

import { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from "@tanstack/react-table";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    Plus,
    Mail,
    Phone,
    MapPin,
    Building2,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    FileText,
    Send,
    Download,
    PieChart
} from "lucide-react";
import { updateDealInvestorAction } from "@/app/actions/deal-details";
import { updateInvestorStage } from "@/app/actions/investor-workflow";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditInvestorDialog } from "@/components/deals/edit-investor-dialog";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/constants";

// Types matching Schema + Client needs
type InvestorRow = {
    organizationId: string;
    dealId: string;
    status: string;
    priority?: number;
    notes?: string;
    organization: {
        id: string;
        name: string;
        type: string;
        address?: string | null;
        description?: string | null;
        industry?: string | null;
        city?: string | null;
    };
    contact?: {
        id: string;
        title?: string | null;
        firstName: string;
        lastName: string;
        role?: string | null;
        email?: string | null;
        phone?: string | null;
    } | null;
    // Milestones
    ndaSentAt?: Date | string | null;
    ndaSignedAt?: Date | string | null;
    ndaRejectedAt?: Date | string | null;
    imSentAt?: Date | string | null;
    imRejectedAt?: Date | string | null;
    contactId?: string | null;
};

const columnHelper = createColumnHelper<InvestorRow>();

export function LonglistTable({ data, dealId }: { data: any[], dealId: string }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [editInvestor, setEditInvestor] = useState<InvestorRow | null>(null);

    const columns = useMemo(() => [
        columnHelper.accessor("organization.name", {
            header: "Unternehmen",
            cell: (info) => {
                const org = info.row.original.organization;
                const type = org.type;
                return (
                    <div className="flex flex-col max-w-[250px] space-y-1">
                        <Link href={`/organizations/${org.id}`} className="flex items-center gap-2 group/org">
                            <span className="font-black text-slate-900 text-sm group-hover/org:text-blue-600 transition-colors uppercase tracking-tight">{org.name}</span>
                            {type && <Badge variant="secondary" className="text-[9px] h-5 px-1.5 uppercase font-black tracking-widest bg-slate-100 text-slate-500 border-none group-hover/org:bg-blue-600 group-hover/org:text-white transition-all">{ORGANIZATION_TYPE_LABELS[type] || type}</Badge>}
                        </Link>
                        {(org.address || org.city) && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{[org.address, org.city].filter(Boolean).join(", ")}</span>
                            </div>
                        )}
                        {org.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed" title={org.description}>
                                {org.description}
                            </p>
                        )}
                    </div>
                );
            }
        }),
        columnHelper.accessor("contact", {
            header: "Ansprechpartner",
            cell: (info) => {
                const contact = info.getValue();
                if (!contact) return <span className="text-slate-400 text-xs italic">Kein direkter Kontakt</span>;

                return (
                    <div className="flex flex-col space-y-1 min-w-[200px]">
                        <Link href={`/contacts/${contact.id}`} className="flex flex-col group/contact">
                            <span className="font-black text-slate-900 text-sm group-hover/contact:text-blue-600 transition-colors tracking-tight">
                                {[contact.title, contact.firstName, contact.lastName].filter(Boolean).join(" ")}
                            </span>
                            {contact.role && (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-0.5 group-hover/contact:text-slate-600 transition-colors">{contact.role}</span>
                            )}
                        </Link>
                        <div className="flex flex-col mt-1 gap-0.5">
                            {contact.email && (
                                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:underline">
                                    <Mail className="w-3 h-3" /> {contact.email}
                                </a>
                            )}
                            {contact.phone && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <Phone className="w-3 h-3" /> {contact.phone}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        }),
        columnHelper.accessor("status", {
            header: "Status & Milestones",
            cell: (info) => {
                const row = info.row.original;
                const status = row.status;

                // Handlers for checkboxes
                const toggleNDA = async (checked: boolean) => {
                    if (checked) {
                        toast.promise(updateInvestorStage(dealId, row.organizationId, "NDA_SENT"), {
                            loading: "Status wird aktualisiert...",
                            success: "NDA als versendet markiert",
                            error: "Fehler beim Aktualisieren"
                        });
                    }
                };

                const toggleIM = async (checked: boolean) => {
                    if (checked) {
                        toast.promise(updateInvestorStage(dealId, row.organizationId, "IM_SENT"), {
                            loading: "Status wird aktualisiert...",
                            success: "IM als versendet markiert",
                            error: "Fehler beim Aktualisieren"
                        });
                    }
                };

                const isNDASent = ["NDA_SENT", "NDA_SIGNED", "IM_SENT", "BID_RECEIVED"].includes(status);
                const isNDASigned = ["NDA_SIGNED", "IM_SENT", "BID_RECEIVED"].includes(status);
                const isIMSent = ["IM_SENT", "BID_RECEIVED"].includes(status);

                return (
                    <div className="flex items-center gap-6">
                        {/* Milestone Checklist */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`nda-${row.organizationId}`}
                                    checked={isNDASent}
                                    onCheckedChange={(c) => toggleNDA(!!c)}
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-3.5 w-3.5"
                                />
                                <div className="grid gap-0.5 leading-none">
                                    <label
                                        htmlFor={`nda-${row.organizationId}`}
                                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                                    >
                                        NDA Versendet
                                    </label>
                                    {row.ndaSentAt && <span className="text-[9px] text-slate-400">{format(new Date(row.ndaSentAt), "dd.MM.yy")}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`im-${row.organizationId}`}
                                    checked={isIMSent}
                                    disabled={!isNDASigned} // Logic fixed: requires NDA Signed
                                    onCheckedChange={(c) => toggleIM(!!c)}
                                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 h-3.5 w-3.5"
                                />
                                <div className="grid gap-0.5 leading-none">
                                    <label
                                        htmlFor={`im-${row.organizationId}`}
                                        className={cn(
                                            "text-xs font-medium leading-none peer-disabled:cursor-not-allowed text-slate-700",
                                            !isNDASigned && "opacity-50"
                                        )}
                                    >
                                        IM Versendet
                                    </label>
                                    {row.imSentAt && <span className="text-[9px] text-slate-400">{format(new Date(row.imSentAt), "dd.MM.yy")}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Current Status Badge */}
                        <div className="ml-auto">
                            <StatusBadge status={status} />
                        </div>
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: "actions",
            cell: (info) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800">
                                <span className="sr-only">Menü öffnen</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => updateInvestorStage(dealId, info.row.original.organizationId, "DROPPED")}>
                                <XCircle className="mr-2 h-4 w-4 text-rose-500" />
                                Absagen / Pass
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditInvestor(info.row.original)}>Details bearbeiten</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        })
    ], [dealId]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
    });

    const downloadExcel = () => {
        const headers = ["Unternehmen", "Typ", "Kontakt", "Email", "Status", "Notizen"];
        const rows = data.map(row => [
            row.organization.name,
            row.organization.type ? (ORGANIZATION_TYPE_LABELS[row.organization.type] || row.organization.type) : "N/A",
            row.contact ? `${row.contact.firstName} ${row.contact.lastName}` : "",
            row.contact?.email || "",
            row.status,
            row.notes || ""
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `longlist_${dealId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between px-1">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Suchen nach Investor, Kontakt..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-9 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-100 transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadExcel}>
                        <Download className="w-4 h-4 mr-2" />
                        Excel Export
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-auto flex-1 relative">
                <Table>
                    <TableHeader className="bg-slate-50/80 sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-slate-50/80 border-slate-200">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-xs font-bold uppercase tracking-wider text-slate-500 h-10">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-slate-50/50 border-slate-100 transition-colors group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 align-top">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                                    Keine Investoren gefunden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditInvestorDialog
                isOpen={!!editInvestor}
                onClose={() => setEditInvestor(null)}
                dealId={dealId}
                investor={editInvestor}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "LONGLIST":
            return <Badge variant="outline" className="text-slate-500 border-slate-200 bg-slate-50">Longlist</Badge>;
        case "SHORTLIST":
            return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Shortlist</Badge>;
        case "CONTACTED":
            return <Badge variant="outline" className="text-indigo-500 border-indigo-200 bg-indigo-50">Angesprochen</Badge>;
        case "NDA_SENT":
            return <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50">NDA Versendet</Badge>;
        case "NDA_SIGNED":
            return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">NDA Unterschrieben</Badge>;
        case "IM_SENT":
            return <Badge variant="outline" className="text-cyan-600 border-cyan-200 bg-cyan-50">IM Versendet</Badge>;
        case "DROPPED":
            return <Badge variant="outline" className="text-rose-500 border-rose-200 bg-rose-50">Abgesagt</Badge>;
        case "BID_RECEIVED":
            return <Badge className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-sm text-white">Angebot</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
