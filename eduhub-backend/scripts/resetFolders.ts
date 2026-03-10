import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting folderIds in Question...');
    await prisma.question.updateMany({
        data: {
            folderId: null
        }
    });
    console.log('Folder IDs in Question set to null.');

    console.log('Deleting all QBank Folders...');
    await prisma.qBankFolder.deleteMany();
    console.log('All QBank Folders deleted successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
