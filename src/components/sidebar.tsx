"use client";

import { LayoutDashboard, Users, Building2, Briefcase, FileText, CheckSquare, BarChart3, Settings, LogOut, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/global-search";
import { useUser } from "@/components/user-context";
import { useState } from "react";

const mainItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Mandate", icon: Briefcase, href: "/deals" },
    { label: "Organisationen", icon: Building2, href: "/organizations" },
    { label: "Kontakte", icon: Users, href: "/contacts" },
];

const toolItems = [
    { label: "Analysen", icon: BarChart3, href: "/analytics" },
    { label: "Einstellungen", icon: Settings, href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser, users, switchUser } = useUser();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    function renderNavItem(item: typeof mainItems[0]) {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                    isActive
                        ? "text-white bg-blue-600/10 shadow-sm"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                )}
            >
                {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full" />
                )}
                <item.icon className={cn(
                    "mr-3 h-4.5 w-4.5 transition-colors duration-200",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500 opacity-50" />}
            </Link>
        );
    }

    return (
        <div className="flex flex-col h-screen w-[260px] bg-slate-950 text-slate-200 border-r border-slate-800/60 shadow-2xl z-50 shrink-0">
            {/* Logo Section */}
            <div className="p-5 pb-3">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                        <span className="font-bold text-white text-lg">B</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold tracking-tight text-white leading-none">Bachert</h1>
                        <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">M&A DealFlow</p>
                    </div>
                </Link>
            </div>

            {/* Global Search */}
            <div className="px-3 pb-4">
                <GlobalSearch />
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Übersicht</p>
                <div className="space-y-1">
                    {mainItems.map(renderNavItem)}
                </div>

                <div className="my-4 mx-4 border-t border-slate-800/40" />

                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Verwaltung</p>
                <div className="space-y-1">
                    {toolItems.map(renderNavItem)}
                </div>
            </nav>

            {/* User Profile with Switcher */}
            <div className="p-3 border-t border-slate-800/50">
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-900/30 hover:bg-slate-900/60 transition-all"
                    >
                        <div
                            className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900 shadow-lg shrink-0"
                            style={{ backgroundColor: currentUser?.avatarColor || "#3b82f6" }}
                        >
                            {currentUser?.initials || "?"}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-white truncate">{currentUser?.name || "..."}</p>
                            <p className="text-[10px] text-slate-500 truncate">{currentUser?.role || ""}</p>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", userMenuOpen && "rotate-180")} />
                    </button>

                    {/* User Switcher Dropdown */}
                    {userMenuOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-150 z-50">
                            <div className="p-2">
                                <p className="px-2 pt-1 pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Team wechseln</p>
                                {users.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => { switchUser(user); setUserMenuOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all",
                                            currentUser?.id === user.id
                                                ? "bg-blue-600/10 text-blue-400"
                                                : "hover:bg-slate-800 text-slate-300"
                                        )}
                                    >
                                        <div
                                            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                            style={{ backgroundColor: user.avatarColor }}
                                        >
                                            {user.initials}
                                        </div>
                                        <Link
                                            href={`/team/${user.id}`}
                                            onClick={(e) => { e.stopPropagation(); setUserMenuOpen(false); }}
                                            className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                                        >
                                            <p className="text-xs font-bold truncate">{user.name}</p>
                                            <p className="text-[9px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                                        </Link>
                                        {currentUser?.id === user.id && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
