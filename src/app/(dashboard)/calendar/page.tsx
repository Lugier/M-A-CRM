import { getCalendarEvents } from "@/app/actions/calendar";
import { CalendarView } from "@/components/calendar-view";

export default async function CalendarPage() {
    const events = await getCalendarEvents();
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <CalendarView events={events as any} />
        </div>
    );
}
