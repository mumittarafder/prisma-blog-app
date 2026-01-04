-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile" TEXT DEFAULT 'active',
ADD COLUMN     "role" TEXT DEFAULT 'USER';
