"use client";

import { useState } from "react";
import { CheckSquare, Plus, Calendar, Briefcase, Trash2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toggleTask, deleteTask, createTask } from "@/app/actions/tasks";
import { toast } from "sonner";
import Link from "next/link";

type TaskData = {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    isCompleted: boolean;
    dealId: string | null;
    deal: { id: string; name: string; stage: string } | null;
    contact: { id: string; firstName: string; lastName: string } | null;
    createdAt: Date;
};

export function TaskList({
    initialTasks,
    deals,
}: {
    initialTasks: TaskData[];
    deals: { id: string; name: string }[];
}) {
    const [tasks, setTasks] = useState<TaskData[]>(initialTasks);
    const [newTitle, setNewTitle] = useState("");
    const [newDealId, setNewDealId] = useState("");
    const [newDueDate, setNewDueDate] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [filter, setFilter] = useState<"all" | "open" | "done">("all");

    const filteredTasks = tasks.filter((t) => {
        if (filter === "open") return !t.isCompleted;
        if (filter === "done") return t.isCompleted;
        return true;
    });

    const openCount = tasks.filter((t) => !t.isCompleted).length;
    const doneCount = tasks.filter((t) => t.isCompleted).length;

    async function handleCreate() {
        if (!newTitle.trim()) return;
        setIsPending(true);
        try {
            const fd = new FormData();
            fd.set("title", newTitle);
            if (newDealId) fd.set("dealId", newDealId);
            if (newDueDate) fd.set("dueDate", newDueDate);
            const result = await createTask(fd);
            if (result?.success) {
                toast.success("Aufgabe erstellt");
                setNewTitle("");
                setNewDealId("");
                setNewDueDate("");
                // Refresh by re-fetching (simple approach)
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

    async function handleToggle(id: string, currentState: boolean) {
        // Optimistic update
        setTasks(tasks.map((t) => (t.id === id ? { ...t, isCompleted: !currentState } : t)));
        try {
            const result = await toggleTask(id, !currentState);
            if (result?.error) {
                toast.error(result.error);
                setTasks(tasks.map((t) => (t.id === id ? { ...t, isCompleted: currentState } : t)));
            }
        } catch {
            setTasks(tasks.map((t) => (t.id === id ? { ...t, isCompleted: currentState } : t)));
        }
    }

    async function handleDelete(id: string) {
        setTasks(tasks.filter((t) => t.id !== id));
        try {
            const result = await deleteTask(id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Aufgabe gelöscht");
            }
        } catch {
            toast.error("Fehler beim Löschen");
        }
    }

    function formatDate(date: Date | null) {
        if (!date) return null;
        return new Date(date).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function isOverdue(date: Date | null) {
        if (!date) return false;
        return new Date(date) < new Date() && !isToday(date);
    }

    function isToday(date: Date | null) {
        if (!date) return false;
        const today = new Date();
        const d = new Date(date);
        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{openCount}</p>
                                <p className="text-xs text-slate-500 font-medium">Offen</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckSquare className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{doneCount}</p>
                                <p className="text-xs text-slate-500 font-medium">Erledigt</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
                                <p className="text-xs text-slate-500 font-medium">Gesamt</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create New Task */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-500" />
                        Neue Aufgabe
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <Input
                            placeholder="Aufgabe eingeben..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="flex-1"
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <select
                            value={newDealId}
                            onChange={(e) => setNewDealId(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Mandat (optional)</option>
                            {deals.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        <Input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="w-40"
                        />
                        <Button
                            onClick={handleCreate}
                            disabled={isPending || !newTitle.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending ? "..." : "Erstellen"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(["all", "open", "done"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                            }`}
                    >
                        {f === "all" ? "Alle" : f === "open" ? "Offen" : "Erledigt"}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {filteredTasks.map((task) => (
                    <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all group ${task.isCompleted ? "opacity-60" : ""
                            }`}
                    >
                        <button
                            onClick={() => handleToggle(task.id, task.isCompleted)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${task.isCompleted
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-slate-300 hover:border-blue-500"
                                }`}
                        >
                            {task.isCompleted && (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-sm font-semibold ${task.isCompleted ? "text-slate-400 line-through" : "text-slate-900"
                                    }`}
                            >
                                {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {task.deal && (
                                    <Link href={`/deals/${task.deal.id}`}>
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] bg-blue-50 text-blue-700 border-none hover:bg-blue-100 cursor-pointer"
                                        >
                                            <Briefcase className="w-2.5 h-2.5 mr-1" />
                                            {task.deal.name}
                                        </Badge>
                                    </Link>
                                )}
                                {task.dueDate && (
                                    <span
                                        className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue(task.dueDate)
                                                ? "text-rose-600"
                                                : isToday(task.dueDate)
                                                    ? "text-amber-600"
                                                    : "text-slate-400"
                                            }`}
                                    >
                                        <Calendar className="w-2.5 h-2.5" />
                                        {isOverdue(task.dueDate) ? "Überfällig: " : ""}
                                        {formatDate(task.dueDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(task.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {filteredTasks.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed">
                        <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">
                            {filter === "open"
                                ? "Keine offenen Aufgaben!"
                                : filter === "done"
                                    ? "Noch keine erledigten Aufgaben."
                                    : "Keine Aufgaben vorhanden."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
