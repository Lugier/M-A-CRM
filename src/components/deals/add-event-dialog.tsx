"use client";

import { useState, useTransition } from "react";
import { createCalendarEvent } from "@/app/actions/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Calendar as CalendarIcon, MapPin, AlignLeft } from "lucide-react";
import { useUser } from "@/components/user-context";
import { EVENT_TYPE_LABELS } from "@/lib/constants";


export function AddEventDialog({ dealId }: { dealId: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { currentUser } = useUser();

    // Form State
    const [title, setTitle] = useState("");
    const [type, setType] = useState("MEETING");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [allDay, setAllDay] = useState(false);
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    const formatDateTimeLocal = (date: Date) => {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && !startDate) {
            // Set defaults when opening
            const now = new Date();
            now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15); // Round to next 15 min
            setStartDate(formatDateTimeLocal(now));

            const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
            setEndDate(formatDateTimeLocal(end));
        }
    };

    const handleSubmit = () => {
        if (!title || !startDate) return;

        startTransition(async () => {
            await createCalendarEvent({
                title,
                startDate,
                endDate: endDate || undefined,
                allDay,
                type,
                location: location || undefined,
                description: description || undefined,
                dealId,
                userId: currentUser?.id,
            });

            // Reset
            setTitle("");
            setLocation("");
            setDescription("");
            setType("MEETING");
            setAllDay(false);
            setOpen(false);
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs bg-white hover:bg-slate-50 border-dashed border-slate-300 hover:border-blue-400 hover:text-blue-600 transition-all">
                    <Plus className="w-3 h-3 mr-1" />
                    Termin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 bg-white">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-blue-500" />
                        Neuer Termin
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5">
                    {/* Title & Type */}
                    <div className="grid grid-cols-4 gap-4 items-start">
                        <div className="col-span-3 space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Titel</Label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="z.B. Management Präsentation"
                                className="font-medium"
                                autoFocus
                            />
                        </div>
                        <div className="col-span-1 space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Typ</Label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full h-10 rounded-md border border-slate-200 px-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400"
                            >
                                {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-700">Datum & Uhrzeit</Label>
                            <div className="flex items-center gap-2">
                                <Switch id="all-day" checked={allDay} onCheckedChange={setAllDay} />
                                <Label htmlFor="all-day" className="text-xs text-slate-500">Ganztägig</Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">Start</Label>
                                <Input
                                    type={allDay ? "date" : "datetime-local"}
                                    value={allDay ? startDate.slice(0, 10) : startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">Ende</Label>
                                <Input
                                    type={allDay ? "date" : "datetime-local"}
                                    value={allDay ? endDate.slice(0, 10) : endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Details */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Ort / Link
                            </Label>
                            <Input
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="Meetingraum oder Zoom-Link"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                <AlignLeft className="w-3 h-3" /> Beschreibung
                            </Label>
                            <Textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Agenda, Notizen, etc."
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={isPending || !title || !startDate} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                        Speichern
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
