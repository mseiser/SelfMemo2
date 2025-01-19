import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import UserSettingsForm from '@/components/ui/settings/userSettingsForm';
import { getCurrentUser } from '@/lib/session';
import { signOut } from 'next-auth/react';
import { UserService } from 'services/UserService';

export default async function RemindersPage() {

    const signedInUser = await getCurrentUser();

    const userService = UserService.getInstance();
    const user = await userService.getUserById(signedInUser?.id as string);

    if (!user) {
        signOut();
        return null;
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
