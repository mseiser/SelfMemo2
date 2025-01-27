import { DashboardStatisticDto } from "@/lib/dtos/statistic";
import { getCurrentUser } from "@/lib/session";
import IReminderRepository from "repositories/IReminderRepository";
import { ReminderRepository } from "repositories/ReminderRepository";

export class StatisticService {
    private static instance: StatisticService;

    private reminderRepository: IReminderRepository;

    private constructor() {
        this.reminderRepository = new ReminderRepository();
    }

    public static getInstance(): StatisticService {
        if (!StatisticService.instance) {
            StatisticService.instance = new StatisticService();
        }

        return StatisticService.instance;
    }

    public async getDashboardStatistics(): Promise<DashboardStatisticDto[]> {
        const user = await getCurrentUser();
        let reminders = await this.reminderRepository.getAll();

        if(user?.role !== "admin") {
            reminders = await this.reminderRepository.getAllByUserId(user?.id || "");
        }

        const totalReminders = reminders.length;
        const disabledReminders = reminders.filter(reminder => reminder.isDisabled).length;
        const remindersWithWarnings = reminders.filter(reminder => reminder.hasWarnings).length;
        const averageWarningsPerReminder =
            remindersWithWarnings > 0
                ? (reminders.reduce((sum, reminder) => sum + (reminder.warningNumber || 0), 0) / remindersWithWarnings).toFixed(2)
                : "0";
        //does not make sense -> can be overwritten the same day -> need extra datastructure to store the last sent dates
        const remindersSentToday = reminders.filter(reminder => {
            if (!reminder.lastSent) return false;
            const lastSentDate = new Date(reminder.lastSent);
            const today = new Date();
            return (
                lastSentDate.getDate() === today.getDate() &&
                lastSentDate.getMonth() === today.getMonth() &&
                lastSentDate.getFullYear() === today.getFullYear()
            );
        }).length;

        return [
            { name: "Total Reminders", value: totalReminders.toString() },
            { name: "Disabled Reminders", value: disabledReminders.toString() },
            { name: "Reminders with Warnings", value: remindersWithWarnings.toString() },
            { name: "Average Warnings per Reminder", value: averageWarningsPerReminder }
        ]
    }

}