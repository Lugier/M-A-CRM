import { getUsers } from "@/app/actions/users";
import { UserProvider } from "@/components/user-context";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";

import { cookies } from "next/headers";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const users = await getUsers();
    const cookieStore = cookies();
    const initialUserId = cookieStore.get("crm_current_user")?.value;

    return (
        <UserProvider initialUsers={users as any} initialUserId={initialUserId}>
            <div className="flex h-screen overflow-hidden bg-white">
                <Sidebar />
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="flex justify-end px-6 py-4 pb-0 shrink-0 z-50">
                        <TopNav />
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        {children}
                    </div>
                </main>
            </div>
        </UserProvider>
    );
}
