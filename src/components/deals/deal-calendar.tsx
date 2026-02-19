"use client";

import { useTransition } from "react";
import { deleteCalendarEvent } from "@/app/actions/calendar";
import { Calendar, Clock, MapPin, Trash2, Milestone, Phone, Video, MoreHorizontal } from "lucide-react";
import { AddEventDialog } from "./add-event-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isToday, isTomorrow, isPast, isThisWeek, format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

const EVENT_TYPE_ICONS: Record<string, any> = {
    MEETING: Video,
    CALL: Phone,
    MILESTONE: Milestone,
    DEADLINE: Calendar,
    OTHER: Calendar,
};

const EVENT_TYPE_COLORS: Record<string, string> = {
    MEETING: "bg-blue-50 text-blue-700 border-blue-100",
    CALL: "bg-emerald-50 text-emerald-700 border-emerald-100",
    DEADLINE: "bg-rose-50 text-rose-700 border-rose-100",
    MILESTONE: "bg-amber-50 text-amber-700 border-amber-100",
    OTHER: "bg-slate-50 text-slate-700 border-slate-100",
};

export function DealCalendar({ events, dealId }: { events: any[]; dealId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (eventId: string) => {
        startTransition(async () => {
            await deleteCalendarEvent(eventId);
        });
    };

    // Grouping
    const now = new Date();
    const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const todayEvents = sortedEvents.filter(e => isToday(new Date(e.startDate)));
    const tomorrowEvents = sortedEvents.filter(e => isTomorrow(new Date(e.startDate)));
    const weekEvents = sortedEvents.filter(e => !isToday(new Date(e.startDate)) && !isTomorrow(new Date(e.startDate)) && isThisWeek(new Date(e.startDate)) && !isPast(new Date(e.startDate)));
    const laterEvents = sortedEvents.filter(e => new Date(e.startDate) > now && !isToday(new Date(e.startDate)) && !isTomorrow(new Date(e.startDate)) && !isThisWeek(new Date(e.startDate)));
    const pastEvents = sortedEvents.filter(e => isPast(new Date(e.startDate)) && !isToday(new Date(e.startDate)));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Kalender & Agenda</h3>
                    <p className="text-xs text-slate-500 mt-1">Nächste Schritte und Termine im Überblick.</p>
                </div>
                <AddEventDialog dealId={dealId} />
            </div>

            <div className="space-y-8">
                {/* Empty State */}
                {events.length === 0 && (
                    <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-blue-400" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">Keine Termine geplant</h4>
                        <p className="text-xs text-slate-400 mt-1 mb-4">Erstellen Sie den ersten Termin für diesen Deal.</p>
                        <AddEventDialog dealId={dealId} />
                    </div>
                )}

                {/* Groups */}
                <EventGroup title="Heute" events={todayEvents} onDelete={handleDelete} activeColor="text-blue-600" />
                <EventGroup title="Morgen" events={tomorrowEvents} onDelete={handleDelete} />
                <EventGroup title="Diese Woche" events={weekEvents} onDelete={handleDelete} />
                <EventGroup title="Später" events={laterEvents} onDelete={handleDelete} />

                {pastEvents.length > 0 && (
                    <div className="pt-4 border-t border-slate-200/60">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Vergangen ({pastEvents.length})
                        </h4>
                        <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                            <div className="space-y-3">
                                {pastEvents.slice(0, 5).reverse().map(event => (
                                    <EventCard key={event.id} event={event} onDelete={handleDelete} simple />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function EventGroup({ title, events, onDelete, activeColor }: { title: string, events: any[], onDelete: (id: string) => void, activeColor?: string }) {
    if (events.length === 0) return null;
    return (
        <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${activeColor || "text-slate-500"}`}>
                {title} <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center">{events.length}</Badge>
            </h4>
            <div className="grid gap-3">
                {events.map(event => (
                    <EventCard key={event.id} event={event} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
}

function EventCard({ event, onDelete, simple }: { event: any; onDelete: (id: string) => void; simple?: boolean }) {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    const Icon = EVENT_TYPE_ICONS[event.type] || Calendar;
    const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.OTHER;

    return (
        <div className={`group relative bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all ${simple ? "bg-slate-50 border-slate-100" : ""}`}>
            <div className="flex items-start gap-4">
                {/* Date Box */}
                <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-0.5">
                        {format(start, "MMM", { locale: de })}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-800 leading-none">
                        {format(start, "d")}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h5 className={`font-bold text-slate-800 ${simple ? "text-sm" : "text-base"} truncate pr-4`}>
                                {event.title}
                            </h5>

                            <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {event.allDay ? (
                                        <span className="font-medium">Ganztägig</span>
                                    ) : (
                                        <span className="tabular-nums">
                                            {format(start, "HH:mm")}
                                            {end && ` - ${format(end, "HH:mm")}`}
                                        </span>
                                    )}
                                </div>
                                {event.location && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate max-w-[150px]">{event.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!simple && (
                            <Badge variant="outline" className={`shrink-0 ${colors} border px-2 py-0.5 h-6 text-[10px] uppercase tracking-wide flex items-center gap-1.5`}>
                                <Icon className="w-3 h-3" />
                                {event.type}
                            </Badge>
                        )}
                    </div>

                    {!simple && event.description && (
                        <p className="text-xs text-slate-500 mt-3 line-clamp-2 pl-3 border-l-2 border-slate-100 italic">
                            {event.description}
                        </p>
                    )}

                    {!simple && event.user && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-5 h-5 rounded-full border border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600" title={event.user.name}>
                                    {event.user.initials}
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-400">erstellt von {event.user.name}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Löschen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
