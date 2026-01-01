-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DOCTOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userProfile" TEXT DEFAULT 'https://az4khupscvsqksn6.public.blob.vercel-storage.com/fotodefault.png';
