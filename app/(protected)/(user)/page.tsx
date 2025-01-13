import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {

  //reroute to users if admin or reminders if user
  const user = await getCurrentUser();
  if (!user || user.role == "admin") redirect("/users");
  redirect("/reminders");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Some statistics.</CardDescription>
      </CardHeader>
      <CardContent>

      </CardContent>
    </Card>
  );
}
