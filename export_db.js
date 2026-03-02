const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportAll() {
    const data = {};

    // Ignore internal properties
    const modelNames = Object.keys(prisma).filter(k =>
        !k.startsWith('_') &&
        !k.startsWith('$') &&
        typeof prisma[k].findMany === 'function'
    );

    for (const modelName of modelNames) {
        try {
            console.log(`Exporting table: ${modelName}...`);
            data[modelName] = await prisma[modelName].findMany();
        } catch (e) {
            console.error(`Error exporting ${modelName}:`, e.message);
        }
    }

    const docsDir = path.join(__dirname, '../docs');
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    const filePath = path.join(docsDir, 'crm-db-data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\nSuccessfully exported full database to ${filePath}`);
}

module.exports = { exportAll };

if (require.main === module) {
    exportAll().catch(e => {
        console.error(e);
        process.exit(1);
    }).finally(async () => {
        await prisma.$disconnect();
    });
}
