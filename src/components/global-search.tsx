"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, SearchResult } from "@/app/actions/search";
import { Search, Briefcase, Building2, User, X } from "lucide-react";

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Ctrl+K / Cmd+K handler
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    // Search debounce
    useEffect(() => {
        if (query.length < 2) { setResults([]); return; }
        setLoading(true);
        const timer = setTimeout(async () => {
            const r = await globalSearch(query);
            setResults(r);
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = useCallback((result: SearchResult) => {
        router.push(result.href);
        setOpen(false);
        setQuery("");
        setResults([]);
    }, [router]);

    const typeIcon = (type: string) => {
        if (type === "deal") return <Briefcase className="w-4 h-4 text-blue-500" />;
        if (type === "organization") return <Building2 className="w-4 h-4 text-emerald-500" />;
        return <User className="w-4 h-4 text-indigo-500" />;
    };

    const typeLabel = (type: string) => {
        if (type === "deal") return "Mandat";
        if (type === "organization") return "Organisation";
        return "Kontakt";
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 rounded-lg transition-all w-full"
            >
                <Search className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">Suchen...</span>
                <kbd className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-500 border border-slate-700">⌘K</kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setOpen(false)} />

            {/* Modal */}
            <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <Search className="w-5 h-5 text-slate-400 shrink-0" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Deals, Organisationen, Kontakte suchen..."
                            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                        />
                        <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {loading && (
                            <div className="p-4 text-center">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="p-2">
                                {results.map((result) => (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {typeIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{result.title}</p>
                                            <p className="text-[10px] text-slate-400 truncate">{result.subtitle}</p>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            {typeLabel(result.type)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {!loading && query.length >= 2 && results.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-xs text-slate-400 font-medium">Keine Ergebnisse für "{query}"</p>
                            </div>
                        )}

                        {!loading && query.length < 2 && (
                            <div className="p-8 text-center">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suchbegriff eingeben</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
