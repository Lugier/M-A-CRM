"use client";

import { useState, useTransition } from "react";
import { createCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar";
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2, Loader2, X, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/user-context";

const EVENT_TYPE_LABELS: Record<string, string> = {
    MEETING: "Meeting",
    CALL: "Call",
    DEADLINE: "Deadline",
    MILESTONE: "Meilenstein",
    OTHER: "Sonstiges",
    TASK: "Aufgabe"
};

const EVENT_TYPE_COLORS: Record<string, string> = {
    MEETING: "bg-blue-500",
    CALL: "bg-emerald-500",
    DEADLINE: "bg-rose-500",
    MILESTONE: "bg-amber-500",
    OTHER: "bg-slate-400",
    TASK: "bg-indigo-500"
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function CalendarView({ events }: { events: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isPending, startTransition] = useTransition();
    const { currentUser } = useUser();

    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [type, setType] = useState("MEETING");
    const [location, setLocation] = useState("");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday = 0
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));

    const getEventsForDate = (date: Date) => {
        return events.filter(e => {
            const ed = new Date(e.startDate);
            return ed.getFullYear() === date.getFullYear() && ed.getMonth() === date.getMonth() && ed.getDate() === date.getDate();
        });
    };

    const handleAdd = () => {
        if (!title || !selectedDate) return;
        const start = new Date(selectedDate);
        const [sh, sm] = startTime.split(":").map(Number);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(selectedDate);
        const [eh, em] = endTime.split(":").map(Number);
        end.setHours(eh, em, 0, 0);

        startTransition(async () => {
            await createCalendarEvent({
                title,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                type,
                location: location || undefined,
                userId: currentUser?.id,
            });
            setTitle(""); setStartTime("09:00"); setEndTime("10:00"); setLocation(""); setType("MEETING");
            setShowForm(false);
        });
    };

    const handleDelete = (eventId: string) => {
        startTransition(async () => { await deleteCalendarEvent(eventId); });
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const today = new Date();
    const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 pb-3 bg-white/40 backdrop-blur-sm border-b border-slate-200 flex-none">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Kalender</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Termine, Deadlines & Meilensteine</p>
                </div>
                <Button onClick={() => { setShowForm(true); setSelectedDate(today); }} className="bg-blue-600 hover:bg-blue-700 h-9 text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Neuer Termin
                </Button>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Calendar Grid */}
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                        <h2 className="text-lg font-bold text-slate-900">
                            {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAYS.map(w => (
                            <div key={w} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1">{w}</div>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, i) => {
                            if (!day) return <div key={`pad-${i}`} className="aspect-square" />;
                            const dayEvents = getEventsForDate(day);
                            const selected = selectedDate && day.getDate() === selectedDate.getDate() && day.getMonth() === selectedDate.getMonth();

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square p-1 rounded-xl border transition-all flex flex-col items-center justify-start gap-0.5 ${selected ? "bg-blue-50 border-blue-300 shadow-sm" :
                                        isToday(day) ? "bg-blue-50/50 border-blue-200" :
                                            "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                                        }`}
                                >
                                    <span className={`text-xs font-bold mt-0.5 ${isToday(day) ? "text-blue-700" :
                                        selected ? "text-blue-700" :
                                            "text-slate-700"
                                        }`}>{day.getDate()}</span>
                                    <div className="flex gap-0.5 flex-wrap justify-center">
                                        {dayEvents.slice(0, 3).map(e => (
                                            <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_COLORS[e.type] || "bg-slate-400"}`} />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar - Day Details */}
                <div className="w-[320px] border-l border-slate-200 bg-white/60 flex flex-col overflow-hidden shrink-0">
                    {selectedDate ? (
                        <>
                            <div className="p-4 border-b border-slate-100 flex-none">
                                <p className="text-sm font-bold text-slate-900">
                                    {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{selectedEvents.length} Termin(e)</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {selectedEvents.map(event => (
                                    <div key={event.id} className="p-3 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-800">{event.title}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Badge variant="outline" className={`text-[8px] h-4 px-1 text-white border-0 ${EVENT_TYPE_COLORS[event.type]}`}>
                                                        {EVENT_TYPE_LABELS[event.type]}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(event.startDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {event.location && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {event.location}
                                                        </span>
                                                    )}
                                                    {/* Show user for tasks/events */}
                                                    {event.user && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1" title={event.isTask ? "Zugewiesen an" : "Organisator"}>
                                                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                                                                {event.user.initials || "U"}
                                                            </div>
                                                            {event.user.name}
                                                        </span>
                                                    )}
                                                </div>
                                                {event.deal && (
                                                    <span className="text-[10px] text-blue-600 flex items-center gap-1 mt-1">
                                                        <Briefcase className="w-3 h-3" /> {event.deal.name}
                                                    </span>
                                                )}
                                            </div>
                                            <button onClick={() => handleDelete(event.id)} disabled={isPending}
                                                className="p-1 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {selectedEvents.length === 0 && (
                                    <div className="text-center py-8">
                                        <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Keine Termine</p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Add Form */}
                            {showForm && (
                                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-none space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Neuer Termin</p>
                                        <button onClick={() => setShowForm(false)} className="p-0.5 hover:bg-slate-200 rounded"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titel..." className="h-8 text-sm" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-7 text-xs" />
                                        <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="h-7 text-xs" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={type} onChange={e => setType(e.target.value)} className="h-7 text-[10px] rounded-md border border-slate-200 px-1.5">
                                            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                        <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Ort..." className="h-7 text-xs" />
                                    </div>
                                    <Button size="sm" className="w-full h-7 text-xs bg-blue-600" onClick={handleAdd} disabled={isPending || !title}>
                                        {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Anlegen
                                    </Button>
                                </div>
                            )}

                            {!showForm && (
                                <div className="p-3 border-t border-slate-100 flex-none">
                                    <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={() => setShowForm(true)}>
                                        <Plus className="w-3 h-3 mr-1" /> Termin hinzufügen
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center p-6">
                            <div>
                                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-xs text-slate-400 font-medium">Tag auswählen</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
