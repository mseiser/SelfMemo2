import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardCard from '@/components/ui/dashboard/DashboardCard';
import { StatisticService } from 'services/StatisticService';

export default async function DashboardPage() {

  //fetch data from api
  const dashboardStats = await StatisticService.getInstance().getDashboardStatistics();

  return (
      <Card>
        <CardHeader>
          <CardTitle className='mb-4'>Dashboard</CardTitle>
          <DashboardCard stats={dashboardStats} />
        </CardHeader>
      </Card>
  );
}
