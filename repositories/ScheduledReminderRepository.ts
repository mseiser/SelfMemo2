import { ScheduledReminder } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import IScheduledReminderRepository from "./IScheduledReminderRepository";
import { CreateScheduledReminderDto, UpdateScheduledReminderDto } from "@/lib/validations/scheduledReminder";

export class ScheduledReminderRepository extends BaseRepository implements IScheduledReminderRepository {
  async getAll(): Promise<ScheduledReminder[]> {
      return await this.prisma.scheduledReminder.findMany(
          
      );
  }

  async getAllByReminderId(reminderId: string): Promise<ScheduledReminder[]> {
      return await this.prisma.scheduledReminder.findMany({
          where: {
              reminderId: reminderId,
          },
      });
  }

  async getByReminderIdAndTimestamp(reminderId: string, timestamp: number): Promise<ScheduledReminder | null> {
        return await this.prisma.scheduledReminder.findFirst({
            where: {
                reminderId: reminderId,
                timestamp: timestamp,
            },
        });
  }

  async create(reminder: CreateScheduledReminderDto): Promise<ScheduledReminder> {
      const newReminder = await this.prisma.scheduledReminder.create({
          data: reminder,
      });

      return newReminder;
  }

  async update(reminder: UpdateScheduledReminderDto): Promise<ScheduledReminder> {
      return await this.prisma.scheduledReminder.update({
          where: {
              id: reminder.id,
          },
          data: reminder,
      });
  }

  async delete(id: string): Promise<ScheduledReminder> {
      return await this.prisma.scheduledReminder.delete({
          where: {
              id: id,
          },
      });
  }

  async deleteAllForReminder(reminderId: string): Promise<void> {
      await this.prisma.scheduledReminder.deleteMany({
          where: {
              reminderId: reminderId,
          },
      });  
  }
}
