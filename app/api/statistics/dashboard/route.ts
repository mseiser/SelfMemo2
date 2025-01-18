import { StatisticService } from "services/StatisticService";
import { DashboardStatisticDto } from "@/lib/dtos/statistic";
import { getCurrentUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== "admin") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const statisticService = StatisticService.getInstance();
        const statistics: DashboardStatisticDto[] = await statisticService.getDashboardStatistics();

        return new NextResponse(JSON.stringify(statistics), { status: 200 });
    } catch (error: any) {
        console.error(error);
        return new NextResponse(
            JSON.stringify({ message: error.message || "An error occurred" }),
            { status: 500 }
        );
    }
}
