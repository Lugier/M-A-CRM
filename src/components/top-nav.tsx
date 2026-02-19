"use client";

import { NotificationBell } from "@/components/ui/notification-bell";
import { useUser } from "@/components/user-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, UserCircle } from "lucide-react";

export function TopNav() {
    const { currentUser, users, switchUser } = useUser();

    if (!currentUser) return null;

    return (
        <div className="flex items-center gap-4">
            <NotificationBell userId={currentUser.id} />

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-10 pl-2 pr-3 gap-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                        <Avatar className="h-7 w-7 ring-2 ring-white shadow-sm">
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: currentUser.avatarColor }}>
                                {currentUser.initials}
                            </div>
                        </Avatar>
                        <div className="text-left hidden sm:block">
                            <p className="text-[11px] font-black text-slate-800 leading-none group-hover:text-blue-600 transition-colors uppercase tracking-tight">{currentUser.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 leading-none mt-1 uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 rounded-2xl shadow-2xl border-slate-200/60" align="end">
                    <div className="p-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 mb-2 flex items-center gap-2">
                        <UserCircle className="w-3 h-3" /> Account wechseln
                    </div>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => switchUser(user)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${user.id === currentUser.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                            >
                                <Avatar className="h-7 w-7 ring-2 ring-white">
                                    <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: user.avatarColor }}>
                                        {user.initials}
                                    </div>
                                </Avatar>
                                <div className="text-left flex-1 min-w-0">
                                    <p className={`text-xs font-bold truncate ${user.id === currentUser.id ? 'text-blue-600' : 'text-slate-700'}`}>{user.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{user.role.replace('_', ' ')}</p>
                                </div>
                                {user.id === currentUser.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
