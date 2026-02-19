"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toggleTaskAction } from "@/app/actions/deal-details";
import { useState } from "react";
import { toast } from "sonner";

export function TaskItem({ task }: { task: any }) {
    const [isCompleted, setIsCompleted] = useState(task.isCompleted);

    async function handleToggle(checked: boolean) {
        setIsCompleted(checked);
        try {
            const result = await toggleTaskAction(task.id, checked);
            if (result && typeof result === 'object' && 'error' in result) {
                toast.error(result.error as string);
                setIsCompleted(!checked); // Rollback
            } else {
                toast.success(checked ? "Aufgabe erledigt" : "Aufgabe wieder offen");
            }
        } catch (e) {
            toast.error("Fehler beim Speichern");
            setIsCompleted(!checked);
        }
    }

    return (
        <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white shadow-sm hover:border-blue-300 transition-colors">
            <Checkbox
                id={task.id}
                checked={isCompleted}
                onCheckedChange={handleToggle}
            />
            <Label
                htmlFor={task.id}
                className={`flex-1 cursor-pointer font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}
            >
                {task.title}
            </Label>
            {task.assignedTo && (
                <div
                    className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-white shadow-sm shrink-0"
                    title={`Zugewiesen an: ${task.assignedTo.name}`}
                    style={{ backgroundColor: task.assignedTo.avatarColor || '#e2e8f0', color: '#fff' }}
                >
                    {task.assignedTo.initials}
                </div>
            )}
        </div>
    );
}
