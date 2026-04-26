-- Add missing interfaceThemeId columns (if not already present)
ALTER TABLE "exam_folders" ADD COLUMN IF NOT EXISTS "interfaceThemeId" TEXT;
ALTER TABLE "exam_categories" ADD COLUMN IF NOT EXISTS "interfaceThemeId" TEXT;
ALTER TABLE "mock_tests" ADD COLUMN IF NOT EXISTS "interfaceThemeId" TEXT;

-- Add foreign key constraints (drop first if they exist to avoid errors)
ALTER TABLE "exam_folders" DROP CONSTRAINT IF EXISTS "exam_folders_interfaceThemeId_fkey";
ALTER TABLE "exam_folders" ADD CONSTRAINT "exam_folders_interfaceThemeId_fkey" FOREIGN KEY ("interfaceThemeId") REFERENCES "exam_interface_themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "exam_categories" DROP CONSTRAINT IF EXISTS "exam_categories_interfaceThemeId_fkey";
ALTER TABLE "exam_categories" ADD CONSTRAINT "exam_categories_interfaceThemeId_fkey" FOREIGN KEY ("interfaceThemeId") REFERENCES "exam_interface_themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mock_tests" DROP CONSTRAINT IF EXISTS "mock_tests_interfaceThemeId_fkey";
ALTER TABLE "mock_tests" ADD CONSTRAINT "mock_tests_interfaceThemeId_fkey" FOREIGN KEY ("interfaceThemeId") REFERENCES "exam_interface_themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
