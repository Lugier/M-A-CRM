"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UserPlus, Briefcase, Building2, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { createContact } from "@/app/actions/contacts";
import { addInvestorToDealAction } from "@/app/actions/deal-details";
import { toast } from "sonner";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function OrganizationQuickAdd({
    organizationId,
    organizationName,
    allDeals
}: {
    organizationId: string;
    organizationName: string;
    allDeals: any[];
}) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("contact");
    const [isPending, setIsPending] = useState(false);

    // Contact form state
    const [contact, setContact] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: ""
    });

    // Deal selection state
    const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
    const [dealPopoverOpen, setDealPopoverOpen] = useState(false);

    async function handleAddContact(e: React.FormEvent) {
        e.preventDefault();
        setIsPending(true);
        try {
            const formData = new FormData();
            formData.append("firstName", contact.firstName);
            formData.append("lastName", contact.lastName);
            formData.append("email", contact.email);
            formData.append("role", contact.role);
            formData.append("organizationId", organizationId);

            const result = await createContact(formData);
            if (result.success) {
                toast.success("Kontakt erfolgreich angelegt");
                setOpen(false);
                resetContact();
            } else {
                toast.error(result.error || "Fehler beim Erstellen");
            }
        } catch (error) {
            toast.error("Ein Fehler ist aufgetreten");
        } finally {
            setIsPending(false);
        }
    }

    async function handleAddToDeal() {
        if (!selectedDealId) return;
        setIsPending(true);
        try {
            const result = await addInvestorToDealAction(selectedDealId, organizationId);
            if (result.success) {
                toast.success(`Zu Mandat hinzugefügt`);
                setOpen(false);
                setSelectedDealId(null);
            } else {
                toast.error(result.error || "Fehler beim Hinzufügen");
            }
        } catch (error) {
            toast.error("Ein Fehler ist aufgetreten");
        } finally {
            setIsPending(false);
        }
    }

    function resetContact() {
        setContact({ firstName: "", lastName: "", email: "", role: "" });
    }

    const selectedDeal = allDeals.find(d => d.id === selectedDealId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 text-[11px] uppercase tracking-wider px-3 shadow-lg shadow-blue-500/20">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Mandate / Kontakte
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Quick-Add für {organizationName}
                    </DialogTitle>
                    <DialogDescription>
                        Fügen Sie schnell neue Kontakte hinzu oder verknüpfen Sie das Unternehmen mit einem Mandat.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="contact" className="text-xs font-bold uppercase tracking-widest">
                            <UserPlus className="w-3.5 h-3.5 mr-2" /> Kontakt
                        </TabsTrigger>
                        <TabsTrigger value="deal" className="text-xs font-bold uppercase tracking-widest">
                            <Briefcase className="w-3.5 h-3.5 mr-2" /> Mandat
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="contact" className="space-y-4">
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vorname</Label>
                                    <Input
                                        placeholder="Max"
                                        value={contact.firstName}
                                        onChange={e => setContact({ ...contact, firstName: e.target.value })}
                                        className="h-9 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nachname *</Label>
                                    <Input
                                        placeholder="Mustermann"
                                        required
                                        value={contact.lastName}
                                        onChange={e => setContact({ ...contact, lastName: e.target.value })}
                                        className="h-9 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">E-Mail</Label>
                                <Input
                                    type="email"
                                    placeholder="max@company.com"
                                    value={contact.email}
                                    onChange={e => setContact({ ...contact, email: e.target.value })}
                                    className="h-9 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rolle / Position</Label>
                                <Input
                                    placeholder="Managing Director"
                                    value={contact.role}
                                    onChange={e => setContact({ ...contact, role: e.target.value })}
                                    className="h-9 focus:ring-blue-500"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kontakt anlegen"}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="deal" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Mandat auswählen</Label>
                            <Popover open={dealPopoverOpen} onOpenChange={setDealPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={dealPopoverOpen}
                                        className="w-full justify-between h-10 border-slate-200"
                                    >
                                        {selectedDealId
                                            ? allDeals.find((deal) => deal.id === selectedDealId)?.name
                                            : "Mandat suchen..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[375px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Mandat suchen..." />
                                        <CommandList>
                                            <CommandEmpty>Kein Mandat gefunden.</CommandEmpty>
                                            <CommandGroup>
                                                {allDeals.map((deal) => (
                                                    <CommandItem
                                                        key={deal.id}
                                                        value={deal.name}
                                                        onSelect={() => {
                                                            setSelectedDealId(deal.id);
                                                            setDealPopoverOpen(false);
                                                        }}
                                                        className="flex items-center gap-2 px-3 py-2"
                                                    >
                                                        <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                            {deal.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800">{deal.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium uppercase">{deal.type} • {deal.status}</span>
                                                        </div>
                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                selectedDealId === deal.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <Button
                            onClick={handleAddToDeal}
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                            disabled={!selectedDealId || isPending}
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zu Longlist hinzufügen"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
