import { getTasks } from "@/app/actions/tasks";
import { getUsers } from "@/app/actions/users";
import TasksPageClient from "@/components/tasks-page-client";

export default async function TasksPage() {
    const tasks = await getTasks();
    const users = await getUsers();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <TasksPageClient initialTasks={tasks as any} users={users as any} />
        </div>
    );
}
