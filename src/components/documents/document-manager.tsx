"use client";

import { useState } from "react";
import { FileText, Plus, Trash2, Download, Filter, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createDocument, deleteDocument } from "@/app/actions/documents";
import { toast } from "sonner";

const DOC_TYPE_LABELS: Record<string, string> = {
    TEASER: "Teaser",
    IM: "Info Memo",
    PROCESS_LETTER: "Process Letter",
    NDA: "NDA",
    DD_DOCUMENT: "DD Dokument",
    OTHER: "Sonstige",
};

const DOC_TYPE_COLORS: Record<string, string> = {
    TEASER: "bg-purple-50 text-purple-700",
    IM: "bg-blue-50 text-blue-700",
    PROCESS_LETTER: "bg-amber-50 text-amber-700",
    NDA: "bg-rose-50 text-rose-700",
    DD_DOCUMENT: "bg-emerald-50 text-emerald-700",
    OTHER: "bg-slate-50 text-slate-700",
};

type DocumentData = {
    id: string;
    name: string;
    path: string;
    type: string;
    version: number;
    dealId: string | null;
    deal: { id: string; name: string } | null;
    createdAt: Date;
};

export function DocumentManager({
    initialDocuments,
    deals,
}: {
    initialDocuments: DocumentData[];
    deals: { id: string; name: string }[];
}) {
    const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("OTHER");
    const [newDealId, setNewDealId] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [filterType, setFilterType] = useState<string>("ALL");

    const filteredDocs = filterType === "ALL" ? documents : documents.filter((d) => d.type === filterType);

    async function handleCreate() {
        if (!newName.trim()) return;
        setIsPending(true);
        try {
            const result = await createDocument({
                name: newName,
                path: `/documents/${newName.toLowerCase().replace(/\s/g, "-")}`,
                type: newType,
                dealId: newDealId || undefined,
            });
            if (result?.success) {
                toast.success("Dokument erstellt");
                setNewName("");
                setNewType("OTHER");
                setNewDealId("");
                setShowCreate(false);
                window.location.reload();
            } else {
                toast.error(result?.error || "Fehler");
            }
        } catch {
            toast.error("Fehler beim Erstellen");
        } finally {
            setIsPending(false);
        }
    }

    async function handleDelete(id: string) {
        setDocuments(documents.filter((d) => d.id !== id));
        try {
            const result = await deleteDocument(id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Dokument gelöscht");
            }
        } catch {
            toast.error("Fehler beim Löschen");
        }
    }

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <Button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Dokument erfassen
                </Button>

                <div className="flex gap-2 ml-auto flex-wrap">
                    {["ALL", ...Object.keys(DOC_TYPE_LABELS)].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === t
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                                }`}
                        >
                            {t === "ALL" ? "Alle" : DOC_TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Form */}
            {showCreate && (
                <Card className="border-blue-200 shadow-sm border-2">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <Input
                                placeholder="Dokumentname..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1"
                            />
                            <select
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={newDealId}
                                onChange={(e) => setNewDealId(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Mandat (optional)</option>
                                {deals.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                onClick={handleCreate}
                                disabled={isPending || !newName.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isPending ? "..." : "Speichern"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Documents Table */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-medium">Dokument</th>
                                <th className="px-6 py-4 font-medium">Typ</th>
                                <th className="px-6 py-4 font-medium">Mandat</th>
                                <th className="px-6 py-4 font-medium">Version</th>
                                <th className="px-6 py-4 font-medium">Erstellt</th>
                                <th className="px-6 py-4 font-medium w-20">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocs.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className="bg-white hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="font-semibold text-slate-900">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="secondary"
                                            className={`border-none text-[10px] font-bold uppercase tracking-wider ${DOC_TYPE_COLORS[doc.type] || DOC_TYPE_COLORS.OTHER
                                                }`}
                                        >
                                            {DOC_TYPE_LABELS[doc.type] || doc.type}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {doc.deal ? (
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase className="w-3 h-3" />
                                                {doc.deal.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">v{doc.version}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        {new Date(doc.createdAt).toLocaleDateString("de-DE")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredDocs.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            <p className="font-medium text-lg">Keine Dokumente vorhanden</p>
                            <p className="text-sm mt-1">Klicken Sie auf &quot;Dokument erfassen&quot; um loszulegen.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
