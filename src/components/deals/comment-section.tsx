"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/app/actions/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

export function CommentSection({ dealId, comments, currentUser }: { dealId: string, comments: any[], currentUser: any }) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            await addComment(dealId, currentUser.id, content);
            setContent("");
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    Kommentare
                </h3>
                <span className="text-xs text-slate-400 font-medium">{comments.length} Beiträge</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        Noch keine Kommentare. Starten Sie die Diskussion!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 text-sm">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ring-2 ring-white"
                                style={{ backgroundColor: comment.user.avatarColor || '#cbd5e1' }}
                            >
                                {comment.user.initials}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-baseline justify-between">
                                    <span className="font-bold text-slate-900">{comment.user.name}</span>
                                    <span className="text-xs text-slate-400 tab-nums">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: de })}
                                    </span>
                                </div>
                                <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-200/60 shadow-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100">
                <div className="flex items-end gap-2">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mb-1"
                        style={{ backgroundColor: currentUser.avatarColor || '#cbd5e1' }}
                    >
                        {currentUser.initials}
                    </div>
                    <div className="flex-1 relative">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Schreiben Sie einen Kommentar..."
                            className="min-h-[80px] resize-none pr-12 py-3 text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 bg-slate-50 focus:bg-white transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isPending || !content.trim()}
                            className="absolute bottom-2 right-2 h-8 w-8 rounded-lg"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
