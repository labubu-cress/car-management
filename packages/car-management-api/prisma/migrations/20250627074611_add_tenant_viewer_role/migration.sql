-- AlterTable
ALTER TABLE `AdminUser` MODIFY `role` ENUM('super_admin', 'admin', 'tenant_viewer') NOT NULL;
