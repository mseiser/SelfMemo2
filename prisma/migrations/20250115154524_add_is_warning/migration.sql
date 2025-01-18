/*
  Warnings:

  - Added the required column `isWarning` to the `scheduledReminders` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_scheduledReminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reminder_id" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "isWarning" BOOLEAN NOT NULL,
    CONSTRAINT "scheduledReminders_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_scheduledReminders" ("id", "reminder_id", "timestamp") SELECT "id", "reminder_id", "timestamp" FROM "scheduledReminders";
DROP TABLE "scheduledReminders";
ALTER TABLE "new_scheduledReminders" RENAME TO "scheduledReminders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
