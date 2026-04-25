
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function globalSearch() {
    console.log("Global search for 'secries'...");
    
    const tables = ['examCategory', 'examFolder', 'mockTest', 'examSubCategory'];
    
    for (const table of tables) {
        const records = await prisma[table].findMany();
        records.forEach(r => {
            const str = JSON.stringify(r).toLowerCase();
            if (str.includes('secries')) {
                console.log(`FOUND in ${table}:`, r);
            }
        });
    }
    console.log("Search finished.");
}

globalSearch().catch(console.error).finally(() => prisma.$disconnect());
