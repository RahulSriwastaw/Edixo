import { prisma } from './config/database';

async function updateDefaults() {
  console.log('--- Updating AI Defaults ---');
  try {
    const updated = await prisma.ai_settings.upsert({
      where: { id: 'singleton' },
      update: { 
        defaultTextModel: 'GEMINI_3_FLASH_PREVIEW', 
        defaultImageModel: 'GEMINI_3_FLASH_PREVIEW' 
      },
      create: { 
        id: 'singleton', 
        defaultTextModel: 'GEMINI_3_FLASH_PREVIEW', 
        defaultImageModel: 'GEMINI_3_FLASH_PREVIEW' 
      }
    });
    console.log('Successfully updated AI settings defaults to Gemini:', updated.defaultTextModel);
  } catch (err) {
    console.error('Failed to update AI settings:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateDefaults();
