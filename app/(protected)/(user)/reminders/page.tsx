"use client";
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import DynamicList from '@/components/ui/DynamicList';
import { Reminder } from '@prisma/client';
import { useApiSwr } from 'hooks/useApiSwr';
import { useToast } from 'hooks/useToast';
import { useRouter } from 'next/navigation';

export default function RemindersPage() {

    const url = "/api/reminders";

    const toast = useToast();

    const { data, error, isLoading } = useApiSwr<Reminder[]>(url);

    const router = useRouter();

    const handleCreateReminder = () => {
        router.push('/reminders/create');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Reminders</CardTitle>
                        <CardDescription>Manage all of your reminders.</CardDescription>
                    </div>
                    <Button onClick={() => handleCreateReminder()} >
                        Create Reminder
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <DynamicList
                    data={data || []}
                    entity="reminders"
                    mutateKey={url}
                    fields={["name", "type", "isDisabled"]}
                    combineFieldsCallbacks={{}}
                    fieldFormatter={{
                        isDisabled: (value) => value ? "Disabled" : "Active",
                        type: (value) => value.charAt(0).toUpperCase() + value.slice(1)
                    }}
                    labelFormatter={{
                        isDisabled: () => "Status"
                    }}
                    filters={false}
                    showEditButton={true}
                    entityButtonText="Edit"
                />
            </CardContent>
        </Card>
    );
}
