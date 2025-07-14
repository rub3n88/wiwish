-- Add email column to users table (safe migration)
-- Step 1: Add email column as nullable first
ALTER TABLE "users" ADD COLUMN "email" text;

-- Step 2: Update existing users with a default email (you can change this)
UPDATE "users" SET "email" = username || '@temp.local' WHERE "email" IS NULL;

-- Step 3: Make the column NOT NULL now that all rows have values
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- Step 4: Add unique constraint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email"); 