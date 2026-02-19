"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, FileText, Send } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ShareStatusProps {
    deal: {
        name: string;
        stage: string;
        investors: any[];
        tasks: any[];
    }
}

export function ShareStatusDialog({ deal }: ShareStatusProps) {
    const [open, setOpen] = useState(false);

    // Auto-generate status text
    const longlistCount = deal.investors.length;
    const interestedCount = deal.investors.filter(i => i.status === "INTERESTED" || i.status === "NDA_SIGNED").length;
    const openTasks = deal.tasks.filter(t => !t.isCompleted).length;

    const defaultText = `
Status Update: ${deal.name}
Phase: ${deal.stage}

Investoren Pipeline:
- Total auf Longlist: ${longlistCount}
- Interessiert / In Gesprächen: ${interestedCount}

Nächste Schritte:
- ${openTasks} offene Aufgaben zu erledigen.

Beste Grüße,
Ihr Bachert Team
    `.trim();

    const [text, setText] = useState(defaultText);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        toast.success("Status kopiert!");
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Send className="w-4 h-4" /> Status Report
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Status Update erstellen</DialogTitle>
                    <DialogDescription>
                        Generieren Sie eine kurze Zusammenfassung für den Mandanten.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={10}
                        className="font-mono text-sm bg-slate-50"
                    />
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={handleCopy} className="gap-2">
                        <Copy className="w-4 h-4" /> Kopieren
                    </Button>
                    <Button onClick={() => { window.open(`mailto:client@example.com?subject=Update: ${deal.name}&body=${encodeURIComponent(text)}`) }}>
                        <Send className="w-4 h-4 mr-2" /> Email öffnen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
