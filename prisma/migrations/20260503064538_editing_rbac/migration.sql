-- AlterTable
ALTER TABLE "permission" ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "parent_id" UUID;

-- AlterTable
ALTER TABLE "role" ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parent_id" UUID;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "permission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
