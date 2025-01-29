import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import ReminderForm from '@/components/ui/reminders/reminder-form';


export default function RemindersCreatePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Reminder</CardTitle>
            </CardHeader>
            <CardContent>
                <ReminderForm />
            </CardContent>
        </Card>
    );
}
