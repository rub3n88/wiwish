-- Add email column to users table
ALTER TABLE "users" ADD COLUMN "email" text NOT NULL DEFAULT '';

-- Add unique constraint to email
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");

-- Update the default value to empty string temporarily to allow existing records
UPDATE "users" SET "email" = '' WHERE "email" IS NULL;

-- Remove the default value after updating existing records
ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT; 