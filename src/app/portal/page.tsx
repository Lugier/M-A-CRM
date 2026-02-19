"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { verifyClientPortalAccess } from "@/app/actions/portal";

export default function PortalLoginPage() {
    const [dealId, setDealId] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        if (!dealId || !password) {
            toast.error("Bitte alle Felder ausfüllen");
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyClientPortalAccess(dealId, password);
            if (result.success) {
                toast.success("Login erfolgreich");
                router.push(`/portal/${dealId}`);
            } else {
                toast.error("Zugangsdaten ungültig");
            }
        } catch (error) {
            toast.error("Ein Fehler ist aufgetreten");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <Card className="w-full max-w-md z-10 shadow-xl border-slate-200 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Mandanten Portal</CardTitle>
                    <CardDescription>
                        Geben Sie Ihre Zugangsdaten ein, um den Deal-Status einzusehen.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="dealId">
                                Deal ID
                            </label>
                            <Input
                                id="dealId"
                                placeholder="z.B. cl..."
                                value={dealId}
                                onChange={e => setDealId(e.target.value)}
                                disabled={isLoading}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                Passwort
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="bg-white"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Prüfe...
                                </>
                            ) : (
                                <>
                                    Anmelden <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
