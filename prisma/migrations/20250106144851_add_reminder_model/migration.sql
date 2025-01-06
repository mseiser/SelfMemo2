-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isDisabled" BOOLEAN NOT NULL,
    "reminder_id" TEXT,
    CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminders_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
