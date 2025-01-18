-- CreateTable
CREATE TABLE "scheduledReminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reminder_id" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    CONSTRAINT "scheduledReminders_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
