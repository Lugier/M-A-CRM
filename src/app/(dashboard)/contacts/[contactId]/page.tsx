import { getContactById } from "@/app/actions/contacts";
import { getOrganizations } from "@/app/actions/organizations";
import { getUsers } from "@/app/actions/users";
import { addComment } from "@/app/actions/comments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Building2, Briefcase, Mail, Phone, Calendar, CheckSquare, MessageSquare, History, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactActions } from "@/components/contacts/contact-actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "sonner";
import { cookies } from "next/headers";

export default async function ContactDetailPage({ params }: { params: { contactId: string } }) {
    const contact = (await getContactById(params.contactId)) as any;
    const organizations = await getOrganizations();
    const users = await getUsers();

    if (!contact) {
        notFound();
    }

    async function submitComment(formData: FormData) {
        "use server";
        const content = formData.get("content") as string;

        const cookieStore = cookies();
        const savedUserId = cookieStore.get("crm_current_user")?.value;

        // Use cookie or fallback to Lukas Ogiermann, then first user
        const userId = savedUserId || users.find(u => u.initials === "LO")?.id || users[0]?.id;

        if (content && userId) {
            await addComment(undefined, userId, content, contact.id);
            revalidatePath(`/contacts/${contact.id}`);
        }
    }

    return (
        <div className="h-full flex flex-col p-4 lg:p-8 overflow-hidden bg-slate-50/30">
            {/* Header */}
            <div className="flex-none mb-6">
                <BackButton label="Zurück zu Kontakten" />
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {contact.lastName.substring(0, 1)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">{contact.firstName} {contact.lastName}</h1>
                                {contact.internalOwner && (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px] font-bold">
                                        <ShieldCheck className="w-3 h-3 mr-1" /> {contact.internalOwner.initials}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5 text-sm"><Building2 className="w-4 h-4 text-slate-300" /> {contact.organization?.name || "Unabhängig"}</span>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none uppercase text-[9px] font-bold tracking-widest px-1.5">Professional</Badge>
                            </div>
                        </div>
                    </div>
                    <ContactActions
                        contact={{
                            id: contact.id,
                            firstName: contact.firstName,
                            lastName: contact.lastName,
                            email: contact.email,
                            phone: contact.phone,
                            role: contact.role,
                            organizationId: contact.organizationId,
                            internalOwnerId: contact.internalOwnerId,
                        }}
                        organizations={organizations.map((o: any) => ({ id: o.id, name: o.name }))}
                        users={users.map((u: any) => ({ id: u.id, name: u.name, initials: u.initials }))}
                    />
                </div>
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                <TabsList className="bg-white/50 border border-slate-200 mb-6 w-fit">
                    <TabsTrigger value="overview" className="text-xs font-bold px-6">Übersicht</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs font-bold px-6">Mandat-Historie ({contact.investorDeals?.length || 0})</TabsTrigger>
                    <TabsTrigger value="comments" className="text-xs font-bold px-6">Kommentare ({contact.comments?.length || 0})</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                    <TabsContent value="overview" className="m-0 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Details */}
                            <div className="space-y-6">
                                <Card className="border-slate-200 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                                        <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Kontaktinformationen
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 lg:p-6 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">E-Mail</p>
                                            <a href={`mailto:${contact.email}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> {contact.email || "N/A"}
                                            </a>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telefon</p>
                                            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {contact.phone || "Nicht hinterlegt"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rolle</p>
                                            <p className="text-sm font-bold text-slate-800">{contact.role || "Professional"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bachert Bezugsperson</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {contact.internalOwner ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold border border-blue-200">
                                                            {contact.internalOwner.initials}
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{contact.internalOwner.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Keine zugewiesen</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1 pt-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mitglied seit</p>
                                            <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {format(new Date(contact.createdAt), "dd.MM.yyyy", { locale: de })}
                                            </p>
                                        </div>

                                        {/* Referrals */}
                                        {contact.connectionsTo && contact.connectionsTo.length > 0 && (
                                            <div className="space-y-1 pt-2 border-t border-slate-100 mt-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Empfohlen durch</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {contact.connectionsTo.map((conn: any) => (
                                                        <Link key={conn.id} href={`/contacts/${conn.from.id}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1.5">
                                                            <User className="w-3.5 h-3.5 text-blue-400" /> {conn.from.firstName} {conn.from.lastName}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Columns */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-slate-200 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-slate-50/50 border-b py-3 px-6">
                                        <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                            <History className="w-4 h-4 text-indigo-500" />
                                            Aktuelle Mandats-Beteiligung
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-100">
                                            {contact.investorDeals?.length > 0 ? (
                                                contact.investorDeals.map((investorDeal: any) => (
                                                    <div key={investorDeal.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <Link href={`/deals/${investorDeal.deal.id}`} className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                                                                {investorDeal.deal.name}
                                                            </Link>
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className="text-[9px] uppercase font-bold text-indigo-600 border-indigo-100 bg-indigo-50/30">
                                                                    {investorDeal.status}
                                                                </Badge>
                                                                {investorDeal.lastContactedAt && (
                                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                                        Zuletzt: {format(new Date(investorDeal.lastContactedAt), "dd.MM.yy")}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Link href={`/deals/${investorDeal.deal.id}?investorId=${investorDeal.id}`} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                                            <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180" />
                                                        </Link>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-12 text-center">
                                                    <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keine aktiven Mandate</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="m-0 space-y-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b py-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <History className="w-4 h-4 text-blue-600" />
                                    Vollständige Mandat-Historie
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Mandat</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Typ</th>
                                            <th className="px-6 py-4 text-right">Aktion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {contact.investorDeals?.map((id: any) => (
                                            <tr key={id.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{id.deal.name}</p>
                                                    <p className="text-[10px] text-slate-400">{format(new Date(id.createdAt), "dd.MM.yyyy")}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="text-[10px] font-bold border-blue-100 bg-blue-50 text-blue-700">
                                                        {id.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{id.type}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/deals/${id.deal.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!contact.investorDeals || contact.investorDeals.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                                    Noch keine Mandate hinterlegt.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="comments" className="m-0 space-y-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b py-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    Interne Kommentare
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {contact.comments?.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-600">
                                                {comment.user.initials}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-slate-900">{comment.user.name}</span>
                                                    <span className="text-[10px] text-slate-400">{format(new Date(comment.createdAt), "dd.MM.yyyy HH:mm")}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!contact.comments || contact.comments.length === 0) && (
                                        <div className="text-center py-12">
                                            <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Noch keine Kommentare</p>
                                        </div>
                                    )}

                                    <form action={submitComment} className="pt-4 border-t">
                                        <textarea
                                            name="content"
                                            placeholder="Kommentar hinzufügen..."
                                            required
                                            className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-[100px]"
                                        />
                                        <div className="flex justify-end mt-2">
                                            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">Senden</Button>
                                        </div>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div >
    );
}
