"use client";

import { useState, useTransition } from "react";
import { addTaskAction, toggleTaskAction, updateTaskAction } from "@/app/actions/deal-details";
import { CheckCircle2, Circle, Plus, Loader2, Flag, Tag, User, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/user-context";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    LOW: { label: "Niedrig", color: "text-slate-400 bg-slate-50", icon: "↓" },
    MEDIUM: { label: "Mittel", color: "text-blue-600 bg-blue-50", icon: "–" },
    HIGH: { label: "Hoch", color: "text-amber-600 bg-amber-50", icon: "↑" },
    CRITICAL: { label: "Kritisch", color: "text-rose-600 bg-rose-50", icon: "!!" },
};

const CATEGORIES = ["Due Diligence", "Legal", "Vermarktung", "Admin", "Investor Relations", "Reporting"];

export function EnhancedQuickAddTask({ dealId, users }: { dealId: string; users: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [category, setCategory] = useState("");
    const [assignedToId, setAssignedToId] = useState("");
    const [expanded, setExpanded] = useState(false);

    const handleAdd = () => {
        if (!title.trim()) return;
        startTransition(async () => {
            await addTaskAction(dealId, title, priority, assignedToId || undefined, category || undefined);
            setTitle(""); setPriority("MEDIUM"); setCategory(""); setAssignedToId("");
            setExpanded(false);
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Neue Aufgabe..."
                    className="h-9 text-sm flex-1"
                    onKeyDown={e => e.key === "Enter" && handleAdd()}
                    onFocus={() => setExpanded(true)}
                />
                <Button size="sm" onClick={handleAdd} disabled={isPending || !title.trim()} className="bg-blue-600 hover:bg-blue-700 h-9">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>
            {expanded && (
                <div className="flex gap-2 flex-wrap animate-in slide-in-from-top-1 duration-150">
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="h-7 text-[10px] rounded-md border border-slate-200 px-1.5 font-bold">
                        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="h-7 text-[10px] rounded-md border border-slate-200 px-1.5">
                        <option value="">Kategorie...</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="h-7 text-[10px] rounded-md border border-slate-200 px-1.5">
                        <option value="">Zuweisen...</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}

export function EnhancedTaskItem({ task }: { task: any }) {
    const [isPending, startTransition] = useTransition();
    const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTaskAction(task.id, !task.isCompleted);
        });
    };

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all group ${task.isCompleted ? "bg-slate-50/30 border-slate-100" : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm"
            }`}>
            <button
                onClick={handleToggle}
                disabled={isPending}
                className="mt-0.5 shrink-0"
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-blue-500 transition-colors" />
                )}
            </button>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${task.isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className={`text-[8px] h-4 px-1 ${priorityConfig.color} border-0`}>
                        {priorityConfig.icon} {priorityConfig.label}
                    </Badge>
                    {task.category && (
                        <Badge variant="outline" className="text-[8px] h-4 px-1 bg-indigo-50 text-indigo-600 border-0">
                            <Tag className="w-2.5 h-2.5 mr-0.5" /> {task.category}
                        </Badge>
                    )}
                    {task.assignedTo && (
                        <Link href={`/team/${task.assignedTo.id}`} className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-blue-600 transition-colors group/user">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white group-hover/user:ring-2 group-hover/user:ring-blue-100 transition-all"
                                style={{ backgroundColor: task.assignedTo.avatarColor }}>
                                {task.assignedTo.initials}
                            </div>
                            <span className="font-medium">{task.assignedTo.name.split(" ")[0]}</span>
                        </Link>
                    )}
                    {task.dueDate && (
                        <span className={`text-[10px] flex items-center gap-1 ${new Date(task.dueDate) < new Date() && !task.isCompleted ? "text-rose-500 font-bold" : "text-slate-400"
                            }`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString('de-DE')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
