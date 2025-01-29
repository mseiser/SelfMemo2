import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import UserForm from '@/components/ui/users/users-form';
import { UserService } from 'services/UserService';

type Params = Promise<{
    id: string
}>;

export default async function RemindersEditPage({ params }: { params: Params }) {
    const userEditParams = await params;
    const userId = userEditParams.id;

    const user = await UserService.getInstance().getUserById(userId);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent>
                <UserForm user={user ?? undefined} />
            </CardContent>
        </Card>
    );
}
