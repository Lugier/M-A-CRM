"use client";

import { useState } from "react";
import {
    CheckCircle2,
    Circle,
    MessageSquare,
    UserPlus,
    ChevronRight,
    Users,
    Plus,
    X,
    MessageCircle,
    Send,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    addStageMember,
    removeStageMember,
    addStageComment
} from "@/app/actions/stage-assignments";
import {
    updateProjectStepAction,
    addDealTeamMemberAction,
    removeDealTeamMemberAction
} from "@/app/actions/deal-details";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/components/user-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const PROJECT_STAGES = [
    { id: "PITCH", label: "Pitch", desc: "Vorbereitung und Durchführung des Pitches" },
    { id: "KICKOFF", label: "Kickoff", desc: "Projektstart und interne Abstimmung" },
    { id: "LL", label: "Longlist", desc: "Erstellung und Abstimmung der Investorenliste" },
    { id: "TEASER", label: "Teaser", desc: "Versand des anonymen Kurzprofils" },
    { id: "NDA", label: "NDA", desc: "Verhandlung und Abschluss der Vertraulichkeitsvereinbarungen" },
    { id: "IM", label: "Info Memo", desc: "Erstellung und Versand des Information Memorandum" },
    { id: "PROZESSBRIEF", label: "Prozessbrief", desc: "Definition der Prozessschritte und Termine" },
    { id: "MP", label: "Management Presentation", desc: "Durchführung der Management-Präsentationen" },
    { id: "NBO", label: "NBO", desc: "Einholung und Auswertung von indikativen Angeboten" },
    { id: "SIGNING_CLOSING", label: "Signing/Closing", desc: "Finale Verhandlung und Vertragsabschluss" }
];

export function ProjectPlan({
    deal,
    allUsers
}: {
    deal: any,
    allUsers: any[]
}) {
    const currentStepIndex = PROJECT_STAGES.findIndex(s => s.id === deal.projectStep);

    async function handleAddTeamMember(userId: string, role: any) {
        const res = await addDealTeamMemberAction(deal.id, userId, role);
        if (res.error) toast.error(res.error);
        else toast.success("Teammitglied hinzugefügt");
    }

    async function handleRemoveTeamMember(userId: string) {
        const res = await removeDealTeamMemberAction(deal.id, userId);
        if (res.error) toast.error(res.error);
        else toast.success("Teammitglied entfernt");
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left side: Stage List */}
            <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3 uppercase">
                        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        Projekt-Meilensteine
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
                        Aktueller Schritt: <span className="text-blue-600 ml-1">{PROJECT_STAGES[currentStepIndex]?.label || deal.projectStep}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {PROJECT_STAGES.map((step, index) => (
                        <StageRow
                            key={step.id}
                            stage={step}
                            deal={deal}
                            allUsers={allUsers}
                            isCurrent={deal.projectStep === step.id}
                            isCompleted={index < currentStepIndex}
                        />
                    ))}
                </div>
            </div>

            {/* Right side: Global Context / Team Summary */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-slate-200/60 shadow-sm bg-white/40 backdrop-blur-md overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                                <Users className="w-4 h-4 text-blue-500" /> Projekt-Team
                            </h4>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-blue-50 hover:text-blue-600">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2 rounded-2xl shadow-2xl border-slate-200/60" align="end">
                                    <div className="p-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 mb-2">Teammitglied hinzufügen</div>
                                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        {allUsers.filter(u => !deal.teamMembers?.some((m: any) => m.userId === u.id)).map(user => (
                                            <div key={user.id} className="flex flex-col gap-1 p-1 hover:bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-3 px-2 py-1">
                                                    <Avatar className="h-6 w-6 ring-2 ring-white">
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: user.avatarColor }}>
                                                            {user.initials}
                                                        </div>
                                                    </Avatar>
                                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{user.name}</span>
                                                </div>
                                                <div className="flex gap-1 px-1 pb-1">
                                                    <button onClick={() => handleAddTeamMember(user.id, 'LEAD_ADVISOR')} className="flex-1 text-[8px] font-black uppercase tracking-tighter py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors">Lead</button>
                                                    <button onClick={() => handleAddTeamMember(user.id, 'SUPPORT')} className="flex-1 text-[8px] font-black uppercase tracking-tighter py-1 bg-slate-50 text-slate-500 rounded hover:bg-slate-500 hover:text-white transition-colors">Support</button>
                                                    <button onClick={() => handleAddTeamMember(user.id, 'ANALYST')} className="flex-1 text-[8px] font-black uppercase tracking-tighter py-1 bg-amber-50 text-amber-600 rounded hover:bg-amber-600 hover:text-white transition-colors">Analyst</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-4">
                            {deal.teamMembers?.map((m: any) => (
                                <div key={m.userId} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 ring-2 ring-white shadow-md">
                                            <div
                                                className="w-full h-full flex items-center justify-center text-[11px] font-black text-white"
                                                style={{ backgroundColor: m.user.avatarColor }}
                                            >
                                                {m.user.initials}
                                            </div>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{m.user.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.role.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3 text-rose-500" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-32 p-1" align="end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50"
                                                    onClick={() => handleRemoveTeamMember(m.userId)}
                                                >
                                                    Entfernen
                                                </Button>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            ))}
                            {(!deal.teamMembers || deal.teamMembers.length === 0) && (
                                <p className="text-[10px] font-bold text-slate-400 text-center py-4 border border-dashed rounded-xl">Keine Mitglieder zugeordnet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-600/20 transition-colors" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3" /> Workflow
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-bold">
                        Nutzen Sie die Meilensteine, um Verantwortlichkeiten festzulegen. Sobald ein Schritt abgeschlossen ist, klicken Sie auf "Aktivieren" beim nächsten Schritt.
                    </p>
                </div>
            </div>
        </div>
    );
}

function StageRow({
    stage,
    deal,
    allUsers,
    isCurrent,
    isCompleted
}: {
    stage: any,
    deal: any,
    allUsers: any[],
    isCurrent: boolean,
    isCompleted: boolean
}) {
    const assignments = (deal.stageMemberships || []).filter((m: any) => m.step === stage.id);
    const stageComments = (deal.comments || []).filter((c: any) => c.step === stage.id);
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleActivate() {
        const res = await updateProjectStepAction(deal.id, stage.id);
        if (res.error) toast.error(res.error);
        else toast.success(`Projektstatus: ${stage.label}`);
    }

    async function handleAddMember(userId: string) {
        const res = await addStageMember(deal.id, stage.id, userId);
        if (res.error) toast.error(res.error);
        else toast.success("Mitarbeiter zugeordnet");
    }

    async function handleRemoveMember(userId: string) {
        const res = await removeStageMember(deal.id, stage.id, userId);
        if (res.error) toast.error(res.error);
        else toast.success("Zuordnung entfernt");
    }

    const { currentUser } = useUser();

    async function handleSubmitComment() {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        if (!currentUser) {
            toast.error("Kein aktiver Benutzer gefunden");
            setIsSubmitting(false);
            return;
        }
        const res = await addStageComment(deal.id, stage.id, currentUser.id, newComment);
        if (res.error) toast.error(res.error);
        else {
            setNewComment("");
            toast.success("Notiz gespeichert");
        }
        setIsSubmitting(false);
    }

    return (
        <Card className={cn(
            "border-slate-200/60 shadow-sm transition-all duration-500 relative overflow-hidden hover:border-slate-300 group",
            isCurrent ? "ring-2 ring-blue-500/20 bg-blue-50/20 border-blue-400/30" : "bg-white/80",
            isCompleted && "bg-slate-50/50"
        )}>
            {/* Status Indicator Bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500",
                isCurrent ? "bg-blue-600 shadow-[2px_0_15px_rgba(37,99,235,0.4)]" :
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
            )} />

            <div className="p-5 lg:p-6">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h4 className={cn(
                                "text-lg font-black tracking-tight uppercase",
                                isCurrent ? "text-blue-700" : isCompleted ? "text-slate-500" : "text-slate-900"
                            )}>
                                {stage.label}
                            </h4>
                            {isCompleted && (
                                <div className="bg-emerald-100 p-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                            )}
                            {isCurrent && (
                                <Badge className="bg-blue-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 h-5 shadow-lg shadow-blue-500/30 border-none">
                                    Aktiv
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{stage.desc}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {!isCurrent && !isCompleted && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleActivate}
                                className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                            >
                                Aktivieren
                            </Button>
                        )}

                        {/* Team Assignment */}
                        <div className="flex items-center -space-x-2 mr-2">
                            {assignments.map((m: any) => (
                                <Popover key={m.userId}>
                                    <PopoverTrigger asChild>
                                        <Avatar className="h-8 w-8 ring-2 ring-white cursor-pointer hover:z-20 transition-all hover:scale-125 shadow-sm">
                                            <div
                                                className="w-full h-full flex items-center justify-center text-[10px] font-black text-white"
                                                style={{ backgroundColor: m.user.avatarColor }}
                                                title={m.user.name}
                                            >
                                                {m.user.initials}
                                            </div>
                                        </Avatar>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-44 p-1 rounded-xl shadow-2xl border-slate-200/60" align="end">
                                        <div className="p-2 border-b border-slate-50 mb-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">{m.user.name}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full h-9 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-black uppercase tracking-widest"
                                            onClick={() => handleRemoveMember(m.userId)}
                                        >
                                            <X className="w-3.5 h-3.5 mr-2" /> Entfernen
                                        </Button>
                                    </PopoverContent>
                                </Popover>
                            ))}

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-2 border-dashed border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all bg-white shadow-sm flex items-center justify-center">
                                        <UserPlus className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2 rounded-2xl shadow-2xl border-slate-200/60" align="end">
                                    <div className="p-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 mb-2">Team zuordnen</div>
                                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        {allUsers.filter(u => !assignments.find((m: any) => m.userId === u.id)).map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddMember(user.id)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 transition-all text-slate-600 font-bold group/user"
                                            >
                                                <Avatar className="h-6 w-6 ring-2 ring-white">
                                                    <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: user.avatarColor }}>
                                                        {user.initials}
                                                    </div>
                                                </Avatar>
                                                <span className="group-hover/user:text-blue-600 transition-colors uppercase tracking-tight">{user.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="h-8 w-px bg-slate-200 mx-1" />

                        {/* Comments Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-9 px-3 text-[11px] font-black flex items-center gap-2.5 transition-all rounded-xl",
                                stageComments.length > 0 ? "text-blue-600 bg-blue-50 border border-blue-100 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                            onClick={() => setIsCommentOpen(!isCommentOpen)}
                        >
                            <MessageSquare className="w-4 h-4" />
                            {stageComments.length > 0 && <span>{stageComments.length}</span>}
                        </Button>
                    </div>
                </div>

                {/* Expanded Comment Section */}
                {isCommentOpen && (
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-500">
                        {stageComments.length > 0 ? (
                            <div className="space-y-4">
                                {stageComments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-4 px-4 py-3 bg-white/60 rounded-2xl border border-slate-100/80 group hover:border-slate-200 transition-all shadow-sm">
                                        <Avatar className="h-7 w-7 shrink-0 ring-2 ring-white">
                                            <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-white shadow-inner" style={{ backgroundColor: comment.user.avatarColor }}>
                                                {comment.user.initials}
                                            </div>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{comment.user.name}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(comment.createdAt), 'dd. MMM HH:mm', { locale: de })}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-bold">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keine Notizen vorhanden</p>
                            </div>
                        )}

                        <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 p-2 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-xl">
                            <input
                                className="flex-1 bg-transparent border-none outline-none px-4 text-xs font-bold text-slate-800 placeholder:text-slate-400"
                                placeholder="Wichtige Notiz oder Entscheidung festhalten..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSubmitComment();
                                }}
                            />
                            <Button
                                size="sm"
                                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-black uppercase text-[10px] tracking-widest gap-2"
                                onClick={handleSubmitComment}
                                disabled={isSubmitting || !newComment.trim()}
                            >
                                Speichern <Send className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
