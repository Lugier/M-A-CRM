"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: string;
    avatarColor: string;
    teamsWebhookUrl?: string | null;
};

type UserContextType = {
    currentUser: User | null;
    users: User[];
    switchUser: (user: User) => void;
};

const UserContext = createContext<UserContextType>({
    currentUser: null,
    users: [],
    switchUser: () => { },
});

export function UserProvider({
    children,
    initialUsers,
    initialUserId
}: {
    children: ReactNode;
    initialUsers: User[];
    initialUserId?: string;
}) {
    // Priority: 1. initialUserId (from server cookie), 2. Lukas Ogiermann (Hardcoded fallback), 3. First user in list
    const getInitialUser = () => {
        if (initialUserId) {
            const found = initialUsers.find(u => u.id === initialUserId);
            if (found) return found;
        }
        return initialUsers.find(u => u.email === "logiermann@bachert-partner.de") || initialUsers[0] || null;
    };

    const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser());
    const [users] = useState<User[]>(initialUsers);

    useEffect(() => {
        // Sync state if it changed in another tab or just to be safe
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        };

        const savedUserId = getCookie("crm_current_user") || localStorage.getItem("crm_current_user");

        if (savedUserId && savedUserId !== currentUser?.id) {
            const found = initialUsers.find(u => u.id === savedUserId);
            if (found) {
                setCurrentUser(found);
            }
        } else if (!savedUserId && currentUser) {
            // Ensure cookie is set if we have a user but no cookie
            document.cookie = `crm_current_user=${currentUser.id}; path=/; max-age=31536000`;
        }
    }, [initialUsers, currentUser]);

    const switchUser = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem("crm_current_user", user.id);
        document.cookie = `crm_current_user=${user.id}; path=/; max-age=31536000`; // 1 year
        // Reload to apply changes to server components
        window.location.reload();
    };

    return (
        <UserContext.Provider value={{ currentUser, users, switchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
