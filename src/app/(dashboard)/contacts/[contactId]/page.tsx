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
import { DEAL_STATUS_LABELS, DEAL_TYPE_LABELS } from "@/lib/constants";

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
        <div className="h-full overflow-y-auto bg-slate-50/30">
            <div className="flex flex-col gap-8 p-4 lg:p-10 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Navigation */}
                <BackButton label="Zurück zur Übersicht" variant="premium" />

                {/* Main Header Card */}
                <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/30 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16 relative z-10">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500 rounded-[35px] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                            <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-[40px] bg-white border-8 border-white shadow-2xl flex items-center justify-center relative z-10 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-90" />
                                <span className="text-white text-5xl lg:text-7xl font-black relative z-20">
                                    {contact.lastName.substring(0, 1)}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 text-center lg:text-left space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                                        {contact.firstName} {contact.lastName}
                                    </h1>
                                    <div className="flex items-center gap-2 mx-auto lg:mx-0">
                                        <Badge className="bg-blue-600 text-white border-none py-1.5 px-4 font-black uppercase tracking-[0.15em] text-[10px] shadow-lg shadow-blue-200">
                                            Professional
                                        </Badge>
                                        {contact.internalOwner && (
                                            <Badge className="bg-amber-100 text-amber-700 border-none py-1.5 px-3 font-black uppercase tracking-[0.15em] text-[10px]">
                                                <ShieldCheck className="w-3 h-3 mr-1.5" /> {contact.internalOwner.initials}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-500" /> {contact.organization?.name || "Unabhängig"}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> {contact.email || "N/A"}</span>
                                </div>
                            </div>

                            <div className="flex justify-center lg:justify-start pt-2">
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
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-white/50 backdrop-blur-md border border-slate-200 p-2 rounded-[35px] h-20 shadow-xl shadow-slate-200/30 w-full lg:w-fit">
                        {[
                            { id: 'overview', label: 'Übersicht', icon: User },
                            { id: 'history', label: 'Mandate', count: contact.investorDeals?.length || 0, icon: Briefcase },
                            { id: 'comments', label: 'Kommentare', count: contact.comments?.length || 0, icon: MessageSquare }
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="rounded-[30px] px-10 font-black uppercase tracking-widest text-[11px] data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full transition-all duration-300 gap-3"
                            >
                                <tab.icon className="w-4 h-4 opacity-50 data-[state=active]:opacity-100" />
                                {tab.label} {tab.count !== undefined && <span>({tab.count})</span>}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="grid grid-cols-1 gap-8">
                        <TabsContent value="overview" className="focus-visible:outline-none m-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Info Card */}
                                <Card className="lg:col-span-1 rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                                    <CardHeader className="pt-10 pb-6 px-8">
                                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Kontaktinformationen</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-10 space-y-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-Mail</p>
                                            <a href={`mailto:${contact.email}`} className="text-base font-black text-blue-600 hover:text-blue-700 transition-colors truncate block">
                                                {contact.email || "Nicht hinterlegt"}
                                            </a>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon</p>
                                            <p className="text-base font-black text-slate-900">{contact.phone || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rolle</p>
                                            <p className="text-base font-black text-slate-900">{contact.role || "Professional"}</p>
                                        </div>
                                        <div className="pt-8 border-t border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mitglied seit</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <p className="text-sm font-black text-slate-900">
                                                    {format(new Date(contact.createdAt), "dd. MMMM yyyy", { locale: de })}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right: Participation Card */}
                                <Card className="lg:col-span-2 rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                                    <CardHeader className="pt-10 pb-6 px-8 flex flex-row items-center justify-between">
                                        <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Aktuelle Beteiligung</CardTitle>
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                            {contact.investorDeals?.length || 0}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-8 pb-10">
                                        <div className="space-y-4">
                                            {contact.investorDeals?.length > 0 ? (
                                                contact.investorDeals.map((investorDeal: any) => (
                                                    <Link key={investorDeal.id} href={`/deals/${investorDeal.deal.id}`} className="group block">
                                                        <div className="p-6 rounded-[30px] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 flex items-center justify-between">
                                                            <div className="flex items-center gap-5">
                                                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                                                    <Briefcase className="w-6 h-6" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{investorDeal.deal.name}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="text-[9px] font-black uppercase border-blue-100 bg-blue-50/50 text-blue-600">
                                                                            {DEAL_STATUS_LABELS[investorDeal.status as string] || investorDeal.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center space-y-4">
                                                    <div className="w-20 h-20 rounded-[30px] bg-slate-50 flex items-center justify-center mx-auto">
                                                        <Briefcase className="w-10 h-10 text-slate-200" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Keine aktiven Mandatsbeteiligungen</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="focus-visible:outline-none m-0">
                            <Card className="rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                                <CardHeader className="pt-10 pb-6 px-8">
                                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Vollständige Historie</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-50">
                                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Mandat</th>
                                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Status</th>
                                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Typ</th>
                                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Aktion</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 text-sm">
                                                {contact.investorDeals?.map((id: any) => (
                                                    <tr key={id.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-8 py-6">
                                                            <p className="font-black text-slate-900 uppercase tracking-tight">{id.deal.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{format(new Date(id.createdAt), "dd.MM.yyyy")}</p>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <Badge variant="outline" className="text-[10px] font-black uppercase border-blue-100 bg-blue-50/50 text-blue-600">
                                                                {DEAL_STATUS_LABELS[id.status as string] || id.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-8 py-6 font-black text-slate-500 text-xs uppercase tracking-widest">{DEAL_TYPE_LABELS[id.type as string] || id.type}</td>
                                                        <td className="px-8 py-6 text-right">
                                                            <Link href={`/deals/${id.deal.id}`} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700">
                                                                Details
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="comments" className="focus-visible:outline-none m-0">
                            <Card className="rounded-[40px] border-none bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
                                <CardHeader className="pt-10 pb-6 px-8">
                                    <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Interne Kommunikation</CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-10 space-y-10">
                                    <div className="space-y-8">
                                        {contact.comments?.map((comment: any) => (
                                            <div key={comment.id} className="flex gap-6 group">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 text-xs font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    {comment.user.initials}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{comment.user.name}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(comment.createdAt), "dd.MM.yy HH:mm")}</span>
                                                    </div>
                                                    <div className="text-sm text-slate-600 bg-slate-50/50 p-5 rounded-[25px] border border-slate-100/50 leading-relaxed font-medium">
                                                        {comment.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <form action={submitComment} className="pt-8 border-t border-slate-100">
                                            <div className="relative group/form">
                                                <div className="absolute inset-0 bg-blue-500/5 rounded-[30px] blur-xl opacity-0 group-focus-within/form:opacity-100 transition-opacity" />
                                                <textarea
                                                    name="content"
                                                    placeholder="Neuen Kommentar hinzufügen..."
                                                    required
                                                    className="w-full text-sm p-6 rounded-[30px] border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all min-h-[150px] relative z-10 font-medium"
                                                />
                                            </div>
                                            <div className="flex justify-end mt-6">
                                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200">
                                                    Kommentar posten
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );

}
