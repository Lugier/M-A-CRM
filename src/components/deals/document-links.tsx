"use client";

import { useState, useTransition } from "react";
import { createDocumentLink, deleteDocumentLink, updateDocumentLinkStatus } from "@/app/actions/document-links";
import { FileText, Plus, ExternalLink, Trash2, Link2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DOC_TYPE_LABELS: Record<string, string> = {
    TEASER: "Teaser",
    IM: "Information Memorandum",
    PROCESS_LETTER: "Process Letter",
    NDA: "NDA",
    DD_DOCUMENT: "DD Dokument",
    OTHER: "Sonstiges",
};

const DOC_TYPE_COLORS: Record<string, string> = {
    TEASER: "bg-blue-50 text-blue-700 border-blue-200",
    IM: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PROCESS_LETTER: "bg-amber-50 text-amber-700 border-amber-200",
    NDA: "bg-rose-50 text-rose-700 border-rose-200",
    DD_DOCUMENT: "bg-indigo-50 text-indigo-700 border-indigo-200",
    OTHER: "bg-slate-50 text-slate-700 border-slate-200",
};

const STATUS_COLORS: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
    REVIEW: "bg-amber-100 text-amber-700 border-amber-200",
    FINAL: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function DocumentLinks({ links, dealId }: { links: any[]; dealId: string }) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [type, setType] = useState("OTHER");
    const [version, setVersion] = useState("v1");

    const handleAdd = () => {
        if (!name || !url) return;
        startTransition(async () => {
            await createDocumentLink({ name, url, type, version, dealId });
            setName(""); setUrl(""); setType("OTHER"); setVersion("v1");
            setShowForm(false);
        });
    };

    const handleDelete = (linkId: string) => {
        startTransition(async () => {
            await deleteDocumentLink(linkId, dealId);
        });
    };

    const handleStatusChange = (linkId: string, newStatus: string) => {
        startTransition(async () => {
            await updateDocumentLinkStatus(linkId, dealId, newStatus);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-indigo-500" />
                    SharePoint-Dokumente
                </h3>
                <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="h-7 text-xs">
                    {showForm ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                    {showForm ? "Abbrechen" : "Link hinzufügen"}
                </Button>
            </div>

            {showForm && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Teaser v3" className="h-8 text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Typ</label>
                            <select value={type} onChange={e => setType(e.target.value)} className="w-full h-8 rounded-md border border-slate-200 px-2 text-sm">
                                {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">SharePoint URL</label>
                        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://bachertpartner.sharepoint.com/..." className="h-8 text-sm" />
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="w-20">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Version</label>
                            <Input value={version} onChange={e => setVersion(e.target.value)} className="h-8 text-sm" />
                        </div>
                        <Button size="sm" onClick={handleAdd} disabled={isPending || !name || !url} className="bg-blue-600 hover:bg-blue-700 h-8">
                            {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                            Speichern
                        </Button>
                    </div>
                </div>
            )}

            {links.length > 0 ? (
                <div className="space-y-2">
                    {links.map(link => (
                        <div key={link.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-800 truncate">{link.name}</span>
                                    {link.version && (
                                        <Badge variant="outline" className="text-[8px] h-4 px-1 bg-slate-50">{link.version}</Badge>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">{link.url}</p>
                            </div>

                            {/* Status Selector */}
                            <select
                                value={link.status || "DRAFT"}
                                onChange={(e) => handleStatusChange(link.id, e.target.value)}
                                className={`text-[9px] font-bold uppercase tracking-wider h-5 px-1 rounded border cursor-pointer ${STATUS_COLORS[link.status || "DRAFT"]}`}
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="REVIEW">Review</option>
                                <option value="FINAL">Final</option>
                            </select>

                            <Badge variant="outline" className={`text-[8px] h-5 px-1.5 ${DOC_TYPE_COLORS[link.type] || DOC_TYPE_COLORS.OTHER}`}>
                                {DOC_TYPE_LABELS[link.type] || link.type}
                            </Badge>
                            <a href={link.url} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4 text-blue-500" />
                            </a>
                            <button onClick={() => handleDelete(link.id)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                !showForm && (
                    <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Keine Dokumente verknüpft</p>
                    </div>
                )
            )}
        </div>
    );
}
