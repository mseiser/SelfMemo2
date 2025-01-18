/*
  Warnings:

  - You are about to drop the column `reminder_id` on the `reminders` table. All the data in the column will be lost.

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
    "lastSent" TEXT,
    "hasWarnings" BOOLEAN NOT NULL,
    "warningNumber" INTEGER DEFAULT 0,
    "warningInterval" TEXT,
    "warningIntervalNumber" INTEGER,
    CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reminders" ("config", "description", "hasWarnings", "id", "isDisabled", "lastSent", "name", "type", "user_id", "warningInterval", "warningIntervalNumber", "warningNumber") SELECT "config", "description", "hasWarnings", "id", "isDisabled", "lastSent", "name", "type", "user_id", "warningInterval", "warningIntervalNumber", "warningNumber" FROM "reminders";
DROP TABLE "reminders";
ALTER TABLE "new_reminders" RENAME TO "reminders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
