"use client";

import { useUser } from "@/components/user-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addActivityAction, parseEmailAction, createEmailLogAndTasks } from "@/app/actions/activities";
import { updateTeamsWebhookAction } from "@/app/actions/user";
import { useState, useRef } from "react";
import {
    History,
    Send,
    AtSign,
    Settings2,
    Check,
    BellRing,
    Sparkles,
    Mail,
    Plus,
    X,
    User as UserIcon,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Using native select for simplicity in list

export function LogActivity({ dealId, allUsers }: { dealId: string; allUsers: any[] }) {
    const { currentUser } = useUser();
    const [content, setContent] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [activeTab, setActiveTab] = useState("note");
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [teamsUrl, setTeamsUrl] = useState(currentUser?.teamsWebhookUrl || "");
    const [isSavingTeams, setIsSavingTeams] = useState(false);

    // Review Mode State
    const [reviewing, setReviewing] = useState(false);
    const [parsedData, setParsedData] = useState<any>(null);
    const [reviewTasks, setReviewTasks] = useState<{ id: string; title: string; assignedToId: string }[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const filteredUsers = allUsers.filter(u => u.id !== currentUser?.id);

    async function handleSubmit() {
        if (activeTab === "note") {
            if (!content.trim()) return;
            setLoading(true);
            try {
                if (!currentUser) throw new Error("Nicht eingeloggt");
                await addActivityAction(dealId, content, currentUser.id);
                setContent("");
                toast.success("Aktivität gespeichert");
            } catch (e: any) {
                toast.error(e.message);
            } finally {
                setLoading(false);
            }
        } else {
            // EMAIL TAB LOGIC
            if (!reviewing) {
                // Step 1: Parse
                if (!emailContent.trim()) return;
                setLoading(true);
                try {
                    const res = await parseEmailAction(dealId, emailContent, currentUser?.id || "");
                    if (res.success && res.data) {
                        setParsedData(res.data);
                        // Map extracted todos to task objects
                        const initialTasks = (res.data.todos || []).map((t: string) => ({
                            id: Math.random().toString(36).substring(7),
                            title: t,
                            assignedToId: currentUser?.id || allUsers[0]?.id || ""
                        }));
                        setReviewTasks(initialTasks);
                        setReviewing(true);
                        toast.success("E-Mail analysiert. Bitte Aufgaben überprüfen.");
                    } else {
                        toast.error("Fehler bei der Analyse: " + res.error);
                    }
                } catch (e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            } else {
                // Step 2: Save
                setLoading(true);
                try {
                    const res = await createEmailLogAndTasks(
                        dealId,
                        currentUser?.id || "",
                        parsedData,
                        reviewTasks.map(t => ({ title: t.title, assignedToId: t.assignedToId }))
                    );

                    if (res.success) {
                        setEmailContent("");
                        setReviewing(false);
                        setParsedData(null);
                        setReviewTasks([]);
                        toast.success("E-Mail & Aufgaben gespeichert");
                        setActiveTab("note");
                    } else {
                        toast.error("Fehler beim Speichern: " + res.error);
                    }
                } catch (e: any) {
                    toast.error(e.message);
                } finally {
                    setLoading(false);
                }
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (activeTab !== "note") return;

        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSuggestionIndex(prev => (prev + 1) % filteredUsers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSuggestionIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(filteredUsers[suggestionIndex].name);
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const pos = e.target.selectionStart;
        setContent(value);
        setCursorPosition(pos);

        const lastChar = value.slice(pos - 1, pos);
        if (lastChar === '@') {
            setShowSuggestions(true);
            setSuggestionIndex(0);
        } else if (lastChar === ' ' || pos === 0) {
            setShowSuggestions(false);
        }
    };

    const insertMention = (userName: string) => {
        const beforeCursor = content.slice(0, cursorPosition);
        const lastAt = beforeCursor.lastIndexOf('@');
        if (lastAt !== -1) {
            const prefix = content.slice(0, lastAt);
            const suffix = content.slice(cursorPosition);
            const newContent = `${prefix}@${userName} ${suffix}`;
            setContent(newContent);
            setShowSuggestions(false);

            // Refocus and set cursor to after the inserted mention
            setTimeout(() => {
                if (textareaRef.current) {
                    const newPos = lastAt + userName.length + 2;
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(newPos, newPos);
                }
            }, 0);
        }
    };

    const handleSaveTeams = async () => {
        if (!currentUser) return;
        setIsSavingTeams(true);
        const res = await updateTeamsWebhookAction(currentUser.id, teamsUrl);
        if (res.success) {
            toast.success("Teams Webhook aktualisiert");
        } else {
            toast.error(res.error);
        }
        setIsSavingTeams(false);
    };

    // Task Management in Review Mode
    const addTask = () => {
        setReviewTasks([...reviewTasks, {
            id: Math.random().toString(36).substring(7),
            title: "",
            assignedToId: currentUser?.id || allUsers[0]?.id || ""
        }]);
    };

    const updateTask = (id: string, field: 'title' | 'assignedToId', value: string) => {
        setReviewTasks(reviewTasks.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const removeTask = (id: string) => {
        setReviewTasks(reviewTasks.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-3 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm relative group/log">
            <div className="flex items-center justify-between mb-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between w-full">
                        <TabsList className="grid w-[200px] grid-cols-2">
                            <TabsTrigger value="note" disabled={reviewing}>Notiz</TabsTrigger>
                            <TabsTrigger value="email">E-Mail</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2">
                            <div className="text-[10px] tracking-widest font-bold text-slate-400">
                                {currentUser?.name || "Gast"}
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-slate-300 hover:text-blue-600">
                                        <Settings2 className="w-3.5 h-3.5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BellRing className="w-4 h-4 text-blue-600" />
                                            <h4 className="font-bold text-sm">Teams Integration</h4>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-tight">
                                            Microsoft Teams Webhook URL für Benachrichtigungen
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://outlook.office.com/webhook/..."
                                                className="h-8 text-[11px] font-mono bg-slate-50 border-slate-200"
                                                value={teamsUrl}
                                                onChange={e => setTeamsUrl(e.target.value)}
                                            />
                                            <Button size="sm" className="h-8 px-2" onClick={handleSaveTeams} disabled={isSavingTeams}>
                                                {isSavingTeams ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white" /> : <Check className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="mt-4 relative">
                        <TabsContent value="note" className="mt-0">
                            <Textarea
                                ref={textareaRef}
                                placeholder="Notizen, Anrufe oder Termine erfassen... (@Name markiert Kollegen)"
                                value={content}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                className="min-h-[100px] bg-slate-50/50 border-slate-200 rounded-xl px-4 py-3 text-[13px] placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                            />
                            {/* Smart Suggestion Popover */}
                            {showSuggestions && (
                                <div className="absolute top-[20px] left-8 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-50 mb-1">
                                        <AtSign className="w-3 h-3 text-blue-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Markieren</span>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto">
                                        {filteredUsers.map((user, idx) => (
                                            <button
                                                key={user.id}
                                                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-3 transition-colors ${idx === suggestionIndex ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                                                onClick={() => insertMention(user.name)}
                                            >
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm" style={{ backgroundColor: user.avatarColor || '#94a3b8' }}>
                                                    {user.initials}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{user.name}</span>
                                                    <span className="text-[9px] opacity-70">{user.role || 'Partner'}</span>
                                                </div>
                                                {idx === suggestionIndex && <Check className="w-3 h-3 ml-auto opacity-60" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="email" className="mt-0">
                            {!reviewing ? (
                                <>
                                    <Textarea
                                        placeholder="Fügen Sie hier den Text der E-Mail ein (Header, Body, etc.)..."
                                        value={emailContent}
                                        onChange={e => setEmailContent(e.target.value)}
                                        className="min-h-[150px] bg-slate-50/50 border-slate-200 rounded-xl px-4 py-3 text-[13px] font-mono text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        KI extrahiert automatisch Betreff, Absender und Zusammenfassung.
                                    </p>
                                </>
                            ) : (
                                <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                                    {/* Summary Review */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Zusammenfassung</h4>
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-700 shadow-sm">
                                            <div className="font-medium text-slate-900 mb-1">{parsedData?.subject}</div>
                                            <div className="text-slate-500 text-xs mb-2">Von: {parsedData?.from}</div>
                                            <div className="text-slate-600 leading-relaxed">{parsedData?.summary}</div>
                                        </div>
                                    </div>

                                    {/* Task Review */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aufgaben ({reviewTasks.length})</h4>
                                            <Button size="sm" variant="ghost" onClick={addTask} className="h-6 w-6 p-0 rounded-full">
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {reviewTasks.map((task) => (
                                                <div key={task.id} className="flex gap-2 items-start group">
                                                    <div className="flex-1 bg-white rounded-lg border border-slate-200 p-2 shadow-sm flex flex-col gap-2">
                                                        <Input
                                                            value={task.title}
                                                            onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                                                            className="h-7 text-xs border-0 border-b border-slate-100 rounded-none px-0 focus-visible:ring-0 placeholder:text-slate-300"
                                                            placeholder="Aufgabe beschreiben..."
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <UserIcon className="w-3 h-3 text-slate-400" />
                                                            <select
                                                                className="text-[10px] bg-transparent border-none text-slate-600 font-medium focus:ring-0 cursor-pointer hover:text-blue-600"
                                                                value={task.assignedToId}
                                                                onChange={(e) => updateTask(task.id, 'assignedToId', e.target.value)}
                                                            >
                                                                {allUsers.map(u => (
                                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeTask(task.id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {reviewTasks.length === 0 && (
                                                <div className="text-center py-4 text-xs text-slate-400 italic">Keine Aufgaben erkannt</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            <div className="flex justify-end items-center pt-1 gap-2">
                {reviewing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setReviewing(false); setParsedData(null); setReviewTasks([]); }}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        Abbrechen
                    </Button>
                )}
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={loading || (activeTab === "note" ? !content.trim() : (!reviewing && !emailContent.trim()))}
                    className="bg-blue-600 hover:bg-blue-700 px-5 shadow-lg shadow-blue-100 rounded-full h-8 font-bold text-[11px]"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/30 border-t-white" />
                    ) : (
                        <>
                            {activeTab === "note" ? (
                                <>
                                    <Send className="w-3.5 h-3.5 mr-2" />
                                    Aktivität loggen
                                </>
                            ) : (
                                !reviewing ? (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                                        Analysieren
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5 mr-2" />
                                        Speichern & Aufgaben erstellen
                                    </>
                                )
                            )}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
