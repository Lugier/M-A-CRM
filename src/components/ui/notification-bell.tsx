"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/app/actions/notifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // Polling for notifications (in a real app, use WebSockets)
    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotifications(userId);
            setNotifications(data);
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [userId]);

    const handleRead = async (id: string, link?: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (link) router.push(link);
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(userId);
        setNotifications([]);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-800">Benachrichtigungen</h4>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider"
                        >
                            Alle gelesen
                        </button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Keine neuen Benachrichtigungen
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleRead(notification.id, notification.link)}
                                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3"
                                >
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-slate-700 leading-snug">{notification.content}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: de })}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
