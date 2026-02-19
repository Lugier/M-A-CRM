"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateOutreachContent, logOutreach } from "@/app/actions/investor-workflow";
import { Loader2, Mail, Copy, Check } from "lucide-react";

interface OutreachDialogProps {
    isOpen: boolean;
    onClose: () => void;
    investor: any; // Type should be imported but keeping it simple for now
    deal: any;
}

export function OutreachDialog({ isOpen, onClose, investor, deal }: OutreachDialogProps) {
    const [template, setTemplate] = useState<string>("TEASER");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Fetch template content when template or investor changes
    useEffect(() => {
        if (isOpen && investor) {
            setGenerating(true);
            generateOutreachContent(deal.id, investor.organization.id, template as any)
                .then(res => {
                    if (res.subject) setSubject(res.subject);
                    if (res.body) setBody(res.body);
                })
                .finally(() => setGenerating(false));
        }
    }, [isOpen, template, investor, deal.id]);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${subject}\n\n${body}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("In die Zwischenablage kopiert");
    };

    const handleSendLog = async () => {
        setLoading(true);
        try {
            // In a real app, this might trigger an API email send. 
            // Here we open the default mail client and log the action.
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            await logOutreach(deal.id, [investor.organization.id], 'EMAIL', body);

            toast.success("Outreach geloggt & Mailprogramm geöffnet");
            onClose();
        } catch (e) {
            toast.error("Fehler beim Loggen");
        } finally {
            setLoading(false);
        }
    };

    if (!investor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Investor ansprechen: {investor.organization.name}</DialogTitle>
                    <DialogDescription>
                        Wähle ein Template und generiere den Email-Entwurf.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="template" className="text-right">
                            Template
                        </Label>
                        <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Wähle Template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEASER">Teaser Versand</SelectItem>
                                <SelectItem value="NDA">NDA Versand</SelectItem>
                                <SelectItem value="PROCESS_LETTER">Prozessbrief</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {generating ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label>Betreff</Label>
                                <div className="p-2 bg-slate-50 border rounded text-sm text-slate-700 font-medium">
                                    {subject}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Nachricht</Label>
                                    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs">
                                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                        Kopieren
                                    </Button>
                                </div>
                                <Textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="min-h-[200px] font-mono text-sm"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Abbrechen</Button>
                    <Button onClick={handleSendLog} disabled={loading || generating} className="gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <Mail className="w-4 h-4" />
                        Loggen & Senden
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
