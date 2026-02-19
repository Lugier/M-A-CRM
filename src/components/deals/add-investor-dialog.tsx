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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { addInvestorToDealAction } from "@/app/actions/deal-details";

interface Organization {
    id: string;
    name: string;
    industry: string | null;
}

export function AddInvestorDialog({ dealId, organizations }: { dealId: string, organizations: Organization[] }) {
    const [open, setOpen] = useState(false);
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    async function handleAdd() {
        if (selectedOrgId) {
            await addInvestorToDealAction(dealId, selectedOrgId);
            setOpen(false);
            setSelectedOrgId(null);
        }
    }

    const selectedOrg = organizations.find(o => o.id === selectedOrgId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                    <Plus className="mr-2 h-4 w-4" /> Investor hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Investor zur Longlist hinzufügen</DialogTitle>
                    <DialogDescription>
                        Suchen Sie nach einer Organisation in der Datenbank.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                                {selectedOrg ? selectedOrg.name : "Firma auswählen..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Firma suchen..." />
                                <CommandList>
                                    <CommandEmpty>Keine Firma gefunden.</CommandEmpty>
                                    <CommandGroup>
                                        {organizations.map((org) => (
                                            <CommandItem
                                                key={org.id}
                                                value={org.name}
                                                onSelect={() => {
                                                    setSelectedOrgId(org.id);
                                                    setPopoverOpen(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", selectedOrgId === org.id ? "opacity-100" : "opacity-0")} />
                                                {org.name} <span className="text-slate-400 ml-2 text-xs">({org.industry || "n/a"})</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <DialogFooter>
                    <Button onClick={handleAdd} disabled={!selectedOrgId}>Hinzufügen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
