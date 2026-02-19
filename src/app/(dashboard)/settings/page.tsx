import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Shield, Bell, Database, Globe } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            <div className="flex items-center justify-between flex-none mb-6">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Einstellungen
                    </h1>
                    <p className="text-sm text-slate-500">
                        Konfigurieren Sie Ihr CRM und verwalten Sie Ihre Einstellungen.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar space-y-6">
                {/* Profile Section */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                        <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            Profil
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 lg:p-6">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                BP
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 leading-tight">Bachert & Partner</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">M&A Advisory</p>
                                <Badge variant="secondary" className="mt-2 bg-blue-50 text-blue-700 border-none text-[9px] font-bold uppercase tracking-widest">
                                    Enterprise Plan
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Grid Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Database className="w-4 h-4 text-emerald-500" />
                                Datenbank
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 lg:p-6 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Provider</span>
                                <span className="text-xs font-bold text-slate-800">Supabase</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Status</span>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-bold">
                                    Verbunden
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Region</span>
                                <span className="text-xs font-bold text-slate-800">eu-central-1</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Globe className="w-4 h-4 text-indigo-500" />
                                Deployment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 lg:p-6 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Platform</span>
                                <span className="text-xs font-bold text-slate-800">Vercel</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Framework</span>
                                <span className="text-xs font-bold text-slate-800">Next.js 14</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">ORM</span>
                                <span className="text-xs font-bold text-slate-800">Prisma</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Bell className="w-4 h-4 text-amber-500" />
                                Benachrichtigungen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 lg:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Deal Updates</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Bei Phasenänderungen</p>
                                </div>
                                <div className="w-8 h-5 bg-blue-600 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Aufgaben</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Vor Fälligkeit erinnern</p>
                                </div>
                                <div className="w-8 h-5 bg-blue-600 rounded-full flex items-center justify-end px-0.5 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-4 h-4 text-rose-500" />
                                Sicherheit
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 lg:p-6 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Verschlüsselung</span>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-bold">
                                    AES-256
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">SSL/TLS</span>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none text-[10px] font-bold">
                                    Aktiv
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Sicherung</span>
                                <span className="text-xs font-bold text-slate-800">Täglich</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Version Info */}
                <div className="text-center py-6 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        DealFlow CRM v1.0.0 • Next.js 14 • Prisma • Supabase
                    </p>
                </div>
            </div>
        </div>
    );
}
