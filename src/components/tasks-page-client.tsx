"use client";

import { useState, useTransition } from "react";
import { toggleTaskCompletion, deleteTask } from "@/app/actions/tasks";
import { CheckCircle2, Clock, Filter, Plus, Search, Calendar, User, AlertCircle, ArrowUpRight, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedQuickAddTask } from "@/components/deals/enhanced-tasks";
import Link from "next/link";
import { useUser } from "@/components/user-context";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    LOW: { label: "Niedrig", color: "bg-slate-100 text-slate-600 border-slate-200", icon: ArrowUpRight },
    MEDIUM: { label: "Mittel", color: "bg-blue-50 text-blue-700 border-blue-200", icon: ArrowUpRight },
    HIGH: { label: "Hoch", color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertCircle },
    CRITICAL: { label: "Kritisch", color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
};

export default function TasksPageClient({ initialTasks, users }: { initialTasks: any[]; users: any[] }) {
    const [tasks, setTasks] = useState(initialTasks);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const { currentUser } = useUser();

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === "ALL" ? !t.isCompleted :
                filter === "MY" ? !t.isCompleted && t.assignedToId === currentUser?.id :
                    filter === "OVERDUE" ? !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date() :
                        filter === "COMPLETED" ? t.isCompleted : true;

        return matchesSearch && matchesFilter;
    });

    const handleToggle = (taskId: string) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
        setTasks(updatedTasks);
        startTransition(async () => {
            await toggleTaskCompletion(taskId);
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Header */}
            <div className="flex-none p-4 lg:p-6 pb-2 lg:pb-3 flex items-center justify-between bg-white/40 backdrop-blur-sm border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Aufgaben</h1>
                    <p className="text-sm text-slate-500 mt-0.5">To-Dos & Team-Aufgaben verwalten</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Suchen..."
                            className="bg-white pl-9 border-slate-200"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex-none px-4 lg:px-6 py-3 flex items-center gap-2 border-b border-slate-200 bg-white/40">
                <FilterButton active={filter === "ALL"} onClick={() => setFilter("ALL")} label="Offen" count={tasks.filter(t => !t.isCompleted).length} />
                <FilterButton active={filter === "MY"} onClick={() => setFilter("MY")} label="Meine Aufgaben" count={tasks.filter(t => !t.isCompleted && t.assignedToId === currentUser?.id).length} />
                <FilterButton active={filter === "OVERDUE"} onClick={() => setFilter("OVERDUE")} label="Überfällig" color="text-rose-600" count={tasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()).length} />
                <div className="w-px h-5 bg-slate-200 mx-2" />
                <FilterButton active={filter === "COMPLETED"} onClick={() => setFilter("COMPLETED")} label="Erledigt" count={tasks.filter(t => t.isCompleted).length} />
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-2">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => {
                            const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
                            const isOverdue = !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

                            return (
                                <div key={task.id} className={`group flex items-start gap-3 p-3 bg-white rounded-xl border transition-all ${task.isCompleted ? 'opacity-60 border-slate-100 bg-slate-50' : 'border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md'}`}>
                                    <button
                                        onClick={() => handleToggle(task.id)}
                                        className={`mt-0.5 flex-none w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${task.isCompleted ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 hover:border-blue-500 bg-white'}`}
                                    >
                                        {task.isCompleted && <CheckSquare className="w-3.5 h-3.5" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <p className={`text-sm font-medium ${task.isCompleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>{task.title}</p>
                                            <div className="flex items-center gap-1.5 flex-none">
                                                {task.deal && (
                                                    <Link href={`/deals/${task.deal.id}`} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md text-slate-600 max-w-[120px] truncate border border-slate-200">
                                                        {task.deal.name}
                                                    </Link>
                                                )}
                                                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-5 border-0 font-bold uppercase tracking-wider ${priority.color}`}>
                                                    {priority.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-3 mt-1.5">
                                            {task.dueDate && (
                                                <span className={`text-[11px] flex items-center gap-1 px-1.5 py-0.5 rounded ${isOverdue ? 'text-rose-700 bg-rose-50 font-bold' : 'text-slate-500 bg-slate-50'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(task.dueDate).toLocaleDateString('de-DE')}
                                                </span>
                                            )}
                                            {task.assignedTo && (
                                                <span className="text-[11px] flex items-center gap-1 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">
                                                    <User className="w-3 h-3" />
                                                    {task.assignedTo.name}
                                                </span>
                                            )}
                                            {task.category && (
                                                <span className="text-[11px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    {task.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-slate-200" />
                            </div>
                            <h3 className="text-slate-900 font-bold">Keine Aufgaben gefunden</h3>
                            <p className="text-slate-500 text-sm mt-1">Passen Sie Ihre Filter an oder erstellen Sie eine neue Aufgabe.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Quick Add */}
                <div className="flex-none w-full lg:w-80 border-l border-slate-200 bg-white/60 p-4 lg:p-6 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-0">
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5" /> Neue Aufgabe
                            </h3>
                        </div>
                        <div className="p-4">
                            <EnhancedQuickAddTask dealId={null} users={users} onSuccess={(t) => setTasks(prev => [t, ...prev])} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterButton({ active, label, count, onClick, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${active ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
        >
            {label}
            {count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] min-w-[1.25rem] text-center ${active ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}
