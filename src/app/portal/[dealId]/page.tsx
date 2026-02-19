"use client";

import { useEffect, useState } from "react";
import { getClientPortalDealData } from "@/app/actions/portal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, PieChart, TrendingUp, Lock } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link"; // Changed from import { Link } from "lucide-react" which is wrong

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateClientFeedback } from "@/app/actions/portal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function PortalDashboard() {
    const params = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.dealId) {
            getClientPortalDealData(params.dealId as string).then(res => {
                setData(res);
                setLoading(false);
            });
        }
    }, [params.dealId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-pulse">Lade Projektdaten...</div></div>;

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Card className="max-w-md w-full text-center p-6">
                <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Zugriff verweigert</h2>
                <p className="text-slate-500 mt-2">Dieses Projekt ist nicht verfügbar oder das Passwort ist falsch.</p>
                <Link href="/portal" className="text-blue-600 hover:underline mt-4 block">Zurück zum Login</Link>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-bold text-slate-900 text-lg">Bachert & Partner <span className="text-slate-400 font-normal">| Deal Room</span></h1>
                    </div>
                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                        Stand: {new Date(data.updatedAt).toLocaleDateString()}
                    </Badge>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
                {/* Project Overview */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">{data.name}</h2>
                    <p className="text-slate-500">Aktuelle Projektphase: <span className="font-semibold text-blue-600 uppercase tracking-wide">{data.stage}</span></p>
                </div>

                <Tabs defaultValue="dashboard" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                        <TabsTrigger value="longlist">Investoren-Longlist</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard" className="space-y-8">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard icon={FileText} label="Longlist" value={data.stats.longlist} color="bg-slate-50 text-slate-600" />
                            <KpiCard icon={CheckCircle2} label="Angesprochen" value={data.stats.contacted} color="bg-blue-50 text-blue-600" />
                            <KpiCard icon={Lock} label="NDA Unterzeichnet" value={data.stats.ndaSigned} color="bg-indigo-50 text-indigo-600" />
                            <KpiCard icon={PieChart} label="Angebote" value={data.stats.bids} color="bg-emerald-50 text-emerald-600" />
                        </div>

                        {/* Timeline */}
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Projekt Historie</CardTitle>
                                        <CardDescription>Meilensteine und Phasenübergänge</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 relative">
                                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100" />
                                        {data.history.map((item: any, i: number) => (
                                            <div key={item.id} className="relative pl-10 flex gap-4">
                                                <div className={`absolute left-4 top-1.5 w-4 h-4 rounded-full border-2 border-white ring-2 ${i === 0 ? "bg-blue-600 ring-blue-100" : "bg-slate-300 ring-slate-100"}`} />
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm uppercase tracking-wide">{item.stage}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Start: {new Date(item.enteredAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Shared Documents (Placeholder for now) */}
                            <div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Dokumente</CardTitle>
                                        <CardDescription>Freigegebene Dateien</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">Teaser.pdf</p>
                                                <p className="text-[10px] text-slate-400">2.4 MB • 12.02.2024</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">NDA_Template.pdf</p>
                                                <p className="text-[10px] text-slate-400">1.1 MB • 10.02.2024</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="longlist">
                        <Card>
                            <CardHeader>
                                <CardTitle>Investoren Longlist</CardTitle>
                                <CardDescription>Bitte prüfen Sie die Liste und hinterlassen Sie Kommentare zu einzelnen Parteien.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Investor / Unternehmen</TableHead>
                                            <TableHead>Typ</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[400px]">Ihr Feedback</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.investors?.map((investor: any) => (
                                            <TableRow key={investor.id}>
                                                <TableCell className="font-medium">{investor.name}</TableCell>
                                                <TableCell>{investor.type}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{investor.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <FeedbackInput initialValue={investor.clientFeedback} investorId={investor.id} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function FeedbackInput({ initialValue, investorId }: { initialValue: string, investorId: string }) {
    const [value, setValue] = useState(initialValue || "");
    const [saving, setSaving] = useState(false);
    const [originalValue, setOriginalValue] = useState(initialValue || "");

    const handleSave = async () => {
        if (value === originalValue) return;
        setSaving(true);
        const res = await updateClientFeedback(investorId, value);
        if (res.success) {
            toast.success("Feedback gespeichert");
            setOriginalValue(value);
        } else {
            toast.error("Fehler beim Speichern");
        }
        setSaving(false);
    };

    return (
        <div className="space-y-2">
            <Textarea
                placeholder="Kommentar eingeben (z.B. 'Bitte nicht kontaktieren')..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-white min-h-[60px] text-sm"
            />
            {value !== originalValue && (
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 w-3 h-3 animate-spin" />}
                        Speichern
                    </Button>
                </div>
            )}
        </div>
    );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
