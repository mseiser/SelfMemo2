/*
  Warnings:

  - Added the required column `hasWarnings` to the `reminders` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isDisabled" BOOLEAN NOT NULL,
    "reminder_id" TEXT,
    "lastSent" TEXT,
    "hasWarnings" BOOLEAN NOT NULL,
    "warningNumber" INTEGER DEFAULT 0,
    "warningInterval" TEXT,
    "warningIntervalNumber" INTEGER,
    CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminders_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reminders" ("config", "description", "id", "isDisabled", "lastSent", "name", "reminder_id", "type", "user_id") SELECT "config", "description", "id", "isDisabled", "lastSent", "name", "reminder_id", "type", "user_id" FROM "reminders";
DROP TABLE "reminders";
ALTER TABLE "new_reminders" RENAME TO "reminders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
