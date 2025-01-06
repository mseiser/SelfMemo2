import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import ReminderList from '@/components/ui/reminders/reminder-list';

export default function RemindersPage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Reminders</CardTitle>
                        <CardDescription>Manage all of your reminders.</CardDescription>
                    </div>
                    <a href="/reminders/create" className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Create new
                    </a>
                </div>
            </CardHeader>
            <CardContent>
                <ReminderList />
            </CardContent>
        </Card>
    );
}
