import { getUserProfile } from "@/app/actions/user-profile";
import { UserProfileClient } from "@/components/team/user-profile-client";
import { notFound } from "next/navigation";

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
    const user = await getUserProfile(params.userId);

    if (!user) notFound();

    return <UserProfileClient user={user} />;
}
