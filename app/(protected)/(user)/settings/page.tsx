import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import UserSettingsForm from '@/components/ui/settings/userSettingsForm';
import { getCurrentUser } from '@/lib/session';
import { UserService } from 'services/UserService';
import { redirect } from "next/navigation";

export default async function RemindersPage() {

    const signedInUser = await getCurrentUser();

    const userService = UserService.getInstance();
    const user = await userService.getUserById(signedInUser?.id as string);

    if (!user) {
        redirect('/');
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <UserSettingsForm user={user} />
            </CardContent>
        </Card>
    );
}
