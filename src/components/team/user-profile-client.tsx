"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Briefcase,
    Mail,
    Shield,
    Calendar,
    ChevronRight,
    ArrowLeft,
    Activity as ActivityIcon,
    TrendingUp,
    Users,
    Target,
    Zap,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

export function UserProfileClient({ user }: { user: any }) {
    const router = useRouter();

    return (
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="flex flex-col gap-8 p-4 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Navigation */}
                <BackButton label="Zurück zur Übersicht" variant="premium" />

                {/* Main Header Profile Section */}
                <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/20 rounded-full blur-[80px] -ml-20 -mb-20" />

                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16 relative z-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500 rounded-[45px] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
                            <Avatar className="h-32 w-32 lg:h-44 lg:w-44 border-8 border-white shadow-2xl relative z-10 rounded-[45px]">
                                <AvatarFallback style={{ backgroundColor: user.avatarColor }} className="text-white text-4xl lg:text-5xl font-black rounded-[40px]">
                                    {user.initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 text-center lg:text-left space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                                        {user.name}
                                    </h1>
                                    <Badge className="w-fit mx-auto lg:mx-0 bg-blue-600 text-white border-none py-1.5 px-4 font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-blue-200">
                                        {user.role}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> {user.email}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>

                            {/* Refined Header Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 max-w-3xl">
                                {[
                                    { label: 'Aktive Mandate', value: user.stats.activeDealsCount, icon: Briefcase, color: 'blue' },
                                    { label: 'Kontakte', value: user.ownedContacts?.length || 0, icon: Users, color: 'emerald' },
                                    { label: 'Aktivitäten', value: user.activities.length, icon: ActivityIcon, color: 'purple' },
                                    { label: 'Status', value: 'Verified', icon: Shield, color: 'indigo' }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-slate-50/50 backdrop-blur-sm rounded-3xl p-5 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-sm",
                                            stat.color === 'blue' ? "bg-blue-600 text-white" :
                                                stat.color === 'emerald' ? "bg-emerald-600 text-white" :
                                                    stat.color === 'purple' ? "bg-purple-600 text-white" : "bg-indigo-600 text-white"
                                        )}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tighter tabular-nums">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">

                    {/* SIDEBAR */}
                    <aside className="lg:col-span-1 space-y-8">
                        {/* Skills Card */}
                        <Card className="rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                                <Zap className="w-32 h-32 text-blue-600 rotate-12 group-hover:rotate-45 transition-transform duration-[2000ms]" />
                            </div>
                            <CardHeader className="pt-10 pb-6 px-8">
                                <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Expertise</CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-10 space-y-10">
                                <div className="flex flex-wrap gap-2.5">
                                    {['M&A Sell-side', 'Modelling', 'Due Diligence', 'Sectors'].map(skill => (
                                        <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-600 border-none px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="space-y-8 pt-8 border-t border-slate-100">
                                    <div className="flex items-center gap-5 group/item">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sektor</p>
                                            <p className="text-sm font-black text-slate-900">TMT & Software</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 group/item">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover/item:bg-purple-600 group-hover/item:text-white transition-all">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Region</p>
                                            <p className="text-sm font-black text-slate-900">DACH / Europe</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* MAIN TABS CONTENT */}
                    <main className="lg:col-span-3">
                        <Tabs defaultValue="projects" className="space-y-8">
                            <TabsList className="bg-white/50 backdrop-blur-md border border-slate-200 p-2 rounded-[35px] h-20 shadow-xl shadow-slate-200/30 w-full lg:w-fit animate-in fade-in zoom-in-95 duration-500">
                                {[
                                    { id: 'projects', label: 'Mandate', count: user.dealTeams.length, icon: Briefcase },
                                    { id: 'contacts', label: 'Kontakte', count: user.ownedContacts?.length || 0, icon: Users },
                                    { id: 'activity', label: 'Timeline', count: null, icon: ActivityIcon }
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="rounded-[30px] px-10 font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full transition-all duration-300 gap-3"
                                    >
                                        <tab.icon className="w-4 h-4 opacity-50 data-[state=active]:opacity-100" />
                                        {tab.label} {tab.count !== null && <span>({tab.count})</span>}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* MANDATE TAB content */}
                            <TabsContent value="projects" className="grid grid-cols-1 md:grid-cols-2 gap-8 focus-visible:outline-none focus-visible:ring-0">
                                {user.dealTeams.map((dt: any) => (
                                    <Link key={dt.deal.id} href={`/deals/${dt.deal.id}`} className="group h-full">
                                        <Card className="bg-white rounded-[40px] border-none shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 overflow-hidden h-full">
                                            <CardHeader className="p-8 pb-4">
                                                <div className="flex justify-between items-start mb-6">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border-slate-100 py-1.5 px-3 rounded-xl">
                                                        {dt.deal.status}
                                                    </Badge>
                                                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{dt.role}</span>
                                                </div>
                                                <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase leading-tight tabular-nums">
                                                    {dt.deal.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-8 pt-4 space-y-8">
                                                <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> {dt.deal.stage}</span>
                                                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> {dt.deal.investors.length} Investors</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-2/5 group-hover:w-1/2 transition-all duration-1000 ease-out" />
                                                </div>
                                            </CardContent>
                                            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Mandatsakte öffnen</span>
                                                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </TabsContent>

                            {/* CONTACTS TAB content */}
                            <TabsContent value="contacts" className="grid grid-cols-1 md:grid-cols-2 gap-8 focus-visible:outline-none focus-visible:ring-0">
                                {user.ownedContacts?.length > 0 ? (
                                    user.ownedContacts.map((contact: any) => (
                                        <Link key={contact.id} href={`/contacts/${contact.id}`} className="group h-full">
                                            <Card className="bg-white rounded-[40px] border-none shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 overflow-hidden h-full">
                                                <CardHeader className="p-8 pb-4">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-none py-1.5 px-3 rounded-xl">
                                                            Kontakt
                                                        </Badge>
                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{contact.role || 'Partner'}</span>
                                                    </div>
                                                    <CardTitle className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tabular-nums">
                                                        {contact.firstName} {contact.lastName}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-8 pt-4 space-y-6">
                                                    <div className="space-y-5">
                                                        <div className="flex items-center gap-4 group/info">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover/info:bg-emerald-600 group-hover/info:text-white transition-colors">
                                                                <Users className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-sm font-black text-slate-700 uppercase tracking-wider">{contact.organization?.name || "Independent"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 group/info">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover/info:bg-emerald-600 group-hover/info:text-white transition-colors">
                                                                <Mail className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-500">{contact.email}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Visitenkarte</span>
                                                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                                                </div>
                                            </Card>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="lg:col-span-2 py-32 text-center bg-white rounded-[50px] border-4 border-dashed border-slate-50 w-full animate-pulse">
                                        <Users className="w-20 h-20 text-slate-100 mx-auto mb-8" />
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-[0.4em]">Keine Kontakte zugewiesen</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* TIMELINE TAB content */}
                            <TabsContent value="activity" className="focus-visible:outline-none focus-visible:ring-0">
                                <Card className="rounded-[50px] border-none bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 p-10 border-b border-slate-100 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Activity stream</CardTitle>
                                        <ActivityIcon className="w-6 h-6 text-blue-500 animate-pulse" />
                                    </CardHeader>
                                    <CardContent className="p-10 lg:p-16">
                                        <div className="space-y-16 relative before:absolute before:inset-0 before:left-[21px] before:w-1 before:bg-gradient-to-b before:from-blue-500 before:via-slate-100 before:to-transparent before:h-full">
                                            {user.activities.map((activity: any) => (
                                                <div key={activity.id} className="relative pl-16 group">
                                                    <div className="absolute left-0 top-1 w-12 h-12 rounded-[20px] bg-white border-2 border-slate-100 flex items-center justify-center shadow-xl z-10 group-hover:border-blue-600 group-hover:scale-110 transition-all duration-500">
                                                        <ActivityIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-5">
                                                            <Badge className="bg-blue-600 text-white border-none py-1.5 px-4 rounded-xl font-black uppercase tracking-widest text-[10px]">
                                                                {activity.type}
                                                            </Badge>
                                                            <span className="text-[11px] text-slate-300 font-black uppercase tracking-tighter tabular-nums">
                                                                {new Date(activity.createdAt).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="bg-slate-50/50 p-8 rounded-[35px] border border-slate-100 group-hover:bg-white group-hover:shadow-2xl group-hover:border-blue-100 transition-all duration-700 relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <p className="text-lg text-slate-600 leading-relaxed font-medium relative z-10 italic">
                                                                "{activity.content}"
                                                            </p>
                                                        </div>
                                                        {activity.deal && (
                                                            <Link href={`/deals/${activity.deal.id}`} className="inline-flex items-center gap-3 text-xs font-black text-blue-600 uppercase tracking-[0.25em] mt-2 border-b-2 border-transparent hover:border-blue-600 transition-all">
                                                                <Briefcase className="w-4 h-4" /> {activity.deal.name}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {user.activities.length === 0 && (
                                                <div className="text-center py-24">
                                                    <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-8">
                                                        <ActivityIcon className="w-12 h-12 text-slate-200" />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-300 uppercase tracking-[0.4em]">Keine Aktivitäten vorhanden</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </div>
    );
}
