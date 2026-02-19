"use client";

import { useState } from "react";
import { Plus, X, Search, Shield, ShieldCheck, User, Users } from "lucide-react";
import Link from "next/link";
import { addDealTeamMember, removeDealTeamMember, updateDealTeamRole } from "@/app/actions/deal-team";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ROLE_CONFIG: Record<string, { label: string, icon: any, color: string, bg: string }> = {
    LEAD_ADVISOR: { label: "Projektleiter", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    PARTNER: { label: "Partner", icon: Shield, color: "text-slate-900", bg: "bg-slate-100" },
    ANALYST: { label: "Analyst", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    SUPPORT: { label: "Support", icon: Users, color: "text-slate-500", bg: "bg-slate-50" },
};

export function DealTeam({ dealId, teamMembers: initialTeamMembers, allUsers }: { dealId: string, teamMembers: any[], allUsers: any[] }) {
    const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
    const [isPending, setIsPending] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const availableUsers = allUsers.filter(u => !teamMembers.find(m => m.userId === u.id));

    async function handleAddMember(userId: string) {
        setIsPending(true);
        const res = await addDealTeamMember(dealId, userId);
        if (res.error) {
            toast.error(res.error as string);
        } else {
            toast.success("Mitglied hinzugefügt");
            setIsAddOpen(false);
            const user = allUsers.find(u => u.id === userId);
            setTeamMembers([...teamMembers, {
                id: `temp-${Date.now()}`,
                userId,
                role: "SUPPORT",
                user: { ...user, initials: user.name.substring(0, 2).toUpperCase() }
            }]);
        }
        setIsPending(false);
    }

    async function handleRemove(userId: string) {
        if (!confirm("Mitglied wirklich entfernen?")) return;
        setIsPending(true);
        const res = await removeDealTeamMember(dealId, userId);
        if (res.error) toast.error(res.error as string);
        else {
            toast.success("Mitglied entfernt");
            setTeamMembers(teamMembers.filter(m => m.userId !== userId));
        }
        setIsPending(false);
    }

    async function handleRoleChange(userId: string, newRole: string) {
        setIsPending(true);
        const res = await updateDealTeamRole(dealId, userId, newRole);
        if (res.error) toast.error(res.error as string);
        else {
            toast.success("Rolle aktualisiert");
            setTeamMembers(teamMembers.map(m => m.userId === userId ? { ...m, role: newRole } : m));
        }
        setIsPending(false);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Projekt Team</h3>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Hinzufügen
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Teammitglied hinzufügen</DialogTitle>
                            <DialogDescription>
                                Wählen Sie einen Kollegen aus, um ihn dem Projekt hinzuzufügen.
                            </DialogDescription>
                        </DialogHeader>
                        <Command className="border rounded-md">
                            <CommandInput placeholder="Kollegen suchen..." />
                            <CommandList>
                                <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
                                <CommandGroup heading="Verfügbare Nutzer">
                                    {availableUsers.map(user => (
                                        <CommandItem key={user.id} onSelect={() => handleAddMember(user.id)} className="cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                                    style={{ backgroundColor: user.avatarColor || '#3b82f6' }}
                                                >
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span>{user.name}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-2">
                {teamMembers.map(member => {
                    const role = ROLE_CONFIG[member.role] || ROLE_CONFIG.SUPPORT;
                    const RoleIcon = role.icon;
                    return (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                            <Link href={`/team/${member.userId}`} className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ring-2 ring-white"
                                    style={{ backgroundColor: member.user.avatarColor }}
                                >
                                    {member.user.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors tracking-tight">{member.user.name}</p>
                                    <p className="text-[10px] text-slate-400">{member.user.email}</p>
                                </div>
                            </Link>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${role.bg} ${role.color} hover:opacity-80`}
                                        disabled={isPending}
                                    >
                                        <RoleIcon className="w-3 h-3" />
                                        {role.label}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                    <div className="space-y-0.5">
                                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleRoleChange(member.userId, key)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-slate-100 transition-colors ${member.role === key ? 'bg-slate-50 font-medium' : 'text-slate-600'}`}
                                            >
                                                <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                                                {config.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="h-px bg-slate-100 my-1" />
                                    <button
                                        onClick={() => handleRemove(member.userId)}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Entfernen
                                    </button>
                                </PopoverContent>
                            </Popover>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
